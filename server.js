import express from 'express';
import pool from './db.js';
import { runFraudDetection } from './safePay.js';
import cors from 'cors';
import { clear } from 'console';

const app = express();
const PORT = 5000;


app.use(cors());

app.use(express.json());

app.get('/api/fraudAlert', async (req, res) => {
    // 1. Run the logic


// Set a manual timeout so the browser doesn't spin forever
    const timeout = setTimeout(() => {
        if (!res.headersSent) {
            console.log("🛑 Step X: MySQL took too long to respond!");
            res.status(504).send("Gateway Timeout: MySQL is not responding.");
        }
    }, 5000); // 5 seconds

     try{
            //1. Get raw data from Database
            const [rows] = await pool.query('SELECT * FROM safepay_records');
          
            //2 pass that raw data into your engine (runFraudDetection) to get the fraud alerts
           const fraudAlert = runFraudDetection(rows);

           res.json({
            status: "Success",
            count: rows.length,
            alerts: fraudAlert
        });
          
           //3 send the results to thr browser
     }catch(error){
       console.error("❌ TERMINAL ERROR LOG:");
        console.error("Code:", error.code);     // e.g., 'ER_NO_SUCH_TABLE'
        console.error("Message:", error.message); // e.g., 'Table transactions.payment_records doesn't exist'
        
        res.status(500).json({ 
            error: "Database error occurred", 
            details: error.message,
            code: error.code 
        });
     }
    });
        
    
    app.post('/api/transactions', async (req, res) => {
    try {
        const { customer, amount, location, is_international } = req.body;

        const query = `
            INSERT INTO safepay_records (customer, amount, location, is_international) 
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await pool.query(query, [customer, amount, location, is_international]);

        console.log("✅ New transaction added! ID:", result.insertId);

        res.status(201).json({
            message: "Transaction recorded successfully",
            transactionId: result.insertId
        });

    } catch (error) {
        console.error("❌ Failed to add transaction:", error.message);
        res.status(500).json({ error: error.message });
    }
});

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
   


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Try visiting http://localhost:5000/api/fraudAlert in your browser!`);
});