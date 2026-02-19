import express from 'express';
import pool from './db.js';
import { runFraudDetection } from './safePay.js';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ── GET: All transactions with risk scores ──────────────────
app.get('/api/fraudAlert', async (req, res) => {
    const timeout = setTimeout(() => {
        if (!res.headersSent) {
            console.log("🛑 MySQL took too long to respond!");
            res.status(504).send("Gateway Timeout: MySQL is not responding.");
        }
    }, 5000);

    try {
        const [rows] = await pool.query('SELECT * FROM safepay_records ORDER BY created_at DESC');
        clearTimeout(timeout);

        // Run every transaction through the contextual risk engine
        const scoredTransactions = runFraudDetection(rows);

        // Separate by risk level for stats
        const stats = {
            total: scoredTransactions.length,
            low: scoredTransactions.filter(t => t.riskLevel === 'LOW').length,
            medium: scoredTransactions.filter(t => t.riskLevel === 'MEDIUM').length,
            high: scoredTransactions.filter(t => t.riskLevel === 'HIGH').length,
        };

        res.json({
            status: "Success",
            stats: stats,
            transactions: scoredTransactions
        });

    } catch (error) {
        clearTimeout(timeout);
        console.error("❌ TERMINAL ERROR LOG:");
        console.error("Code:", error.code);
        console.error("Message:", error.message);

        res.status(500).json({
            error: "Database error occurred",
            details: error.message,
            code: error.code
        });
    }
});

// ── POST: Add transaction + get instant risk assessment ─────
app.post('/api/transactions', async (req, res) => {
    try {
        const { customer, amount, location, is_international, password_changed } = req.body;

        // If "Simulate Password Change" was checked, set password_changed_at to NOW
        const passwordChangedAt = password_changed ? new Date() : null;

        const query = `
            INSERT INTO safepay_records (customer, amount, location, is_international, password_changed_at, created_at) 
            VALUES (?, ?, ?, ?, ?, NOW())
        `;

        const [result] = await pool.query(query, [
            customer, amount, location, is_international, passwordChangedAt
        ]);

        console.log("✅ New transaction added! ID:", result.insertId);

        // Re-fetch ALL data and score the new transaction in context
        // SHORT DELAY: Wait 500ms to ensure MySQL has committed the row and it's visible
        await new Promise(resolve => setTimeout(resolve, 500));

        const [allRows] = await pool.query('SELECT * FROM safepay_records ORDER BY created_at DESC');
        console.log(`📊 Fetched ${allRows.length} rows for risk analysis`);

        const scoredAll = runFraudDetection(allRows);

        // Find the one we just inserted
        // Convert both to strings to ensure loose matching (14 vs "14")
        const newTx = scoredAll.find(t => String(t.id) === String(result.insertId));

        console.log("🔍 Risk Assessment for new ID:", result.insertId, newTx ? "FOUND" : "NOT FOUND");
        if (newTx) console.log("🚦 Action:", newTx.action, "Score:", newTx.riskScore);

        // If still not found, construct a temporary object so the UI doesn't break
        const fallbackTx = newTx || {
            id: result.insertId,
            customer, amount, location, is_international,
            riskScore: 0, riskLevel: 'LOW', action: 'APPROVE', reasons: ['Processing...']
        };

        res.status(201).json({
            message: "Transaction recorded successfully",
            transactionId: result.insertId,
            riskAssessment: fallbackTx // Always return something
        });

    } catch (error) {
        console.error("❌ Failed to add transaction:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// ── DELETE: Resolve an alert ────────────────────────────────
app.delete('/api/transactions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM safepay_records WHERE id = ?', [id]);

        console.log(`🗑️ Deleted transaction ID: ${id}`);
        res.json({ message: "Transaction deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ── START SERVER ────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🛡️  SafePay Server running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard API: http://localhost:${PORT}/api/fraudAlert`);
});
