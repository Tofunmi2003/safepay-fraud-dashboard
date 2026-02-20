// ═══════════════════════════════════════════════════════════
// SafePay Contextual Risk Engine v2.0
// Replaces static rules with a weighted risk scoring system.
// ═══════════════════════════════════════════════════════════

// ── Signal Weights ──────────────────────────────────────────
const WEIGHTS = {
    amount: 0.30,   // S1: Amount Deviation
    velocity: 0.40,   // S2: Transaction Velocity (most important)
    time: 0.10,   // S3: Time / Context Risk
    account: 0.20,   // S4: Account Change Risk
};

// ── Thresholds ──────────────────────────────────────────────
const THRESHOLDS = {
    LOW_MAX: 0.40,   // 0.00 – 0.40 → APPROVE
    MEDIUM_MAX: 0.75,   // 0.41 – 0.75 → CHALLENGE
    // 0.76 – 1.00 → BLOCK
};

// ── Signal 1: Amount Deviation ──────────────────────────────
// How far is this transaction from the customer's average?
function calcAmountDeviation(amount, allAmounts) {
    if (!allAmounts || allAmounts.length === 0) return 0;

    const avg = allAmounts.reduce((sum, a) => sum + a, 0) / allAmounts.length;
    if (avg === 0) return 0;

    const deviation = Math.abs(amount - avg) / avg;

    // Normalize: deviation of 3x the average = max risk (1.0)
    return Math.min(deviation / 3, 1.0);
}

// ── Signal 2: Velocity ──────────────────────────────────────
// How many transactions happened in the last 15 minutes?
function calcVelocity(transactionTime, allTimestamps) {
    if (!allTimestamps || allTimestamps.length === 0) return 0;

    const fifteenMinAgo = new Date(transactionTime.getTime() - 15 * 60 * 1000);

    const recentCount = allTimestamps.filter(t => {
        const ts = new Date(t);
        return ts >= fifteenMinAgo && ts <= transactionTime;
    }).length;

    // Normalize: 5+ transactions in 15 min = max risk (1.0)
    return Math.min(recentCount / 5, 1.0);
}

// ── Signal 3: Time & Context Risk ───────────────────────────
// Is this at a risky hour (midnight–5am)? Is it international?
function calcTimeRisk(transactionTime, isInternational) {
    let score = 0;

    const hour = transactionTime.getHours();
    if (hour >= 0 && hour <= 5) {
        score += 0.6; // High-risk time window
    }

    if (isInternational) {
        score += 0.4; // International adds risk
    }

    return Math.min(score, 1.0);
}

// ── Signal 4: Account Change Risk ───────────────────────────
// Was the password changed in the last 24 hours?
function calcAccountRisk(passwordChangedAt) {
    if (!passwordChangedAt) return 0;

    const now = new Date();
    const changeTime = new Date(passwordChangedAt);
    const hoursSinceChange = (now - changeTime) / (1000 * 60 * 60);

    if (hoursSinceChange <= 1) return 1.0;     // Changed in last hour = max risk
    if (hoursSinceChange <= 6) return 0.7;     // Changed in last 6 hours
    if (hoursSinceChange <= 24) return 0.4;    // Changed in last 24 hours
    return 0;                                   // Older than 24 hours = no risk
}

// ── Risk Level Classifier ───────────────────────────────────
function classifyRisk(score) {
    if (score <= THRESHOLDS.LOW_MAX) return { level: 'LOW', action: 'APPROVE' };
    if (score <= THRESHOLDS.MEDIUM_MAX) return { level: 'MEDIUM', action: 'CHALLENGE' };
    return { level: 'HIGH', action: 'BLOCK' };
}

// ── Reason Generator (The Explainable Feature) ─────────────
function generateReasons(signals) {
    const reasons = [];

    if (signals.amountDeviation > 0.5) {
        reasons.push(`Unusual amount: ${(signals.amountDeviation * 100).toFixed(0)}% above customer average`);
    }
    if (signals.velocity > 0.4) {
        const count = Math.round(signals.velocity * 5);
        reasons.push(`High velocity: ${count} transactions in the last 15 minutes`);
    }
    if (signals.timeRisk > 0.3) {
        const parts = [];
        if (signals.isLateNight) parts.push('late-night transaction (12am–5am)');
        if (signals.isInternational) parts.push('international transaction');
        reasons.push(`Risk context: ${parts.join(' + ')}`);
    }
    if (signals.accountRisk > 0.3) {
        reasons.push('Recent account change: password modified within 24 hours');
    }

    if (reasons.length === 0) {
        reasons.push('Transaction appears normal');
    }

    return reasons;
}

// ═══════════════════════════════════════════════════════════
// MAIN ENGINE: Processes ALL transactions and scores each one
// ═══════════════════════════════════════════════════════════
export const runFraudDetection = (data) => {
    // Gather global stats for relative comparison
    const allAmounts = data.map(t => parseFloat(t.amount));
    const allTimestamps = data.map(t => t.created_at).filter(Boolean);

    return data.map((transaction) => {
        const amount = parseFloat(transaction.amount);
        const txTime = transaction.created_at ? new Date(transaction.created_at) : new Date();
        const isInternational = transaction.is_international === 1;
        const passwordChangedAt = transaction.password_changed_at || null;

        // ── Calculate each signal ────────────────
        const s1 = calcAmountDeviation(amount, allAmounts);
        const s2 = calcVelocity(txTime, allTimestamps);
        const s3 = calcTimeRisk(txTime, isInternational);
        const s4 = calcAccountRisk(passwordChangedAt);

        // ── Calculate total risk score ───────────
        let riskScore = (WEIGHTS.amount * s1) +
            (WEIGHTS.velocity * s2) +
            (WEIGHTS.time * s3) +
            (WEIGHTS.account * s4);

        // 🚨 OVERRIDE: If any single signal is MAXED OUT (1.0), force at least Medium Risk
        // This prevents a huge $1M transaction from being "Green" just because it's local/daytime.
        if (s1 >= 1.0 || s2 >= 1.0 || s4 >= 1.0) {
            riskScore = Math.max(riskScore, 0.5);
        }

        // 🚨 CRITICAL OVERRIDE: If Amount deviation is extreme, force HIGH RISK
        if (s1 >= 0.9) {
            riskScore = Math.max(riskScore, 0.8);
        }

        const clampedScore = Math.min(Math.max(riskScore, 0), 1);

        // ── Classify and explain ─────────────────
        const { level, action } = classifyRisk(clampedScore);

        const hour = txTime.getHours();
        const reasons = generateReasons({
            amountDeviation: s1,
            velocity: s2,
            timeRisk: s3,
            accountRisk: s4,
            isLateNight: hour >= 0 && hour <= 5,
            isInternational: isInternational,
        });

        return {
            ...transaction,
            riskScore: parseFloat(clampedScore.toFixed(3)),
            riskLevel: level,
            action: action,
            reasons: reasons,
            signals: {
                amountDeviation: parseFloat(s1.toFixed(3)),
                velocity: parseFloat(s2.toFixed(3)),
                timeRisk: parseFloat(s3.toFixed(3)),
                accountRisk: parseFloat(s4.toFixed(3)),
            }
        };
    });
};