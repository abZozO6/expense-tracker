const express = require("express"); // its a web framework for Node.js that simplifies the process of building web applications and APIs. It provides a set of features and tools to handle HTTP requests, routing, middleware, and more, making it easier to create server-side applications.
const cors = require("cors"); // Cross-Origin Resource Sharing (CORS) is a security feature implemented by web browsers that restricts web pages from making requests to a different domain than the one that served the web page. The cors package in Node.js is a middleware that allows you to enable CORS for your Express applications, making it possible for your server to handle requests from different origins.
const { Pool } = require("pg"); // The Pool class is part of the node-postgres (pg) library, which is a PostgreSQL client for Node.js. It provides a way to manage a pool of database connections, allowing your application to efficiently handle multiple concurrent database queries without having to create and close connections for each request. By using a connection pool, you can improve performance and resource utilization in your application when interacting with a PostgreSQL database.
require("dotenv").config(); // The dotenv package is a zero-dependency module that loads environment variables from a .env file into process.env. It allows you to manage configuration settings and sensitive information (like database credentials, API keys, etc.) separately from your codebase, making it easier to maintain and secure your application. By using dotenv, you can keep your environment-specific settings in a single file and access them throughout your Node.js application.

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json()); 

// PostgreSQL connection
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// GET all expenses
app.get("/api/expenses", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                id,
                title,
                amount::float8 AS amount,
                category,
                to_char(date, 'YYYY-MM-DD') AS date
            FROM expenses
            ORDER BY id
        `);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// GET one expense
app.get("/api/expenses/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(404).json({ message: "Expense not found" });
    }

    try {
        const result = await pool.query(`
            SELECT
                id,
                title,
                amount::float8 AS amount,
                category,
                to_char(date, 'YYYY-MM-DD') AS date
            FROM expenses
            WHERE id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Expense not found" });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// POST new expense
app.post("/api/expenses", async (req, res) => {
    const { title, amount, category, date } = req.body;

    const allowedCategories = [
        "Food",
        "Transport",
        "Bills",
        "Entertainment",
        "Health",
        "Other"
    ];

    if (!title || typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({ message: "Title is required" });
    }

    if (Number(amount) <= 0 || !Number.isFinite(Number(amount))) {
        return res.status(400).json({
            message: "Amount must be a number greater than 0"
        });
    }

    if (!allowedCategories.includes(category)) {
        return res.status(400).json({
            message: "Invalid category"
        });
    }

    if (!date) {
        return res.status(400).json({
            message: "Date is required"
        });
    }

    try {
        const result = await pool.query(`
            INSERT INTO expenses (title, amount, category, date)
            VALUES ($1, $2, $3, $4)
            RETURNING
                id,
                title,
                amount::float8 AS amount,
                category,
                to_char(date, 'YYYY-MM-DD') AS date
        `, [
            title.trim(),
            Number(amount),
            category,
            date
        ]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// PUT update expense
app.put("/api/expenses/:id", async (req, res) => {
    const id = Number(req.params.id);  // The id is extracted from the request parameters and converted to a number.
    const { title, amount, category, date } = req.body; 

    const allowedCategories = [
        "Food",
        "Transport",
        "Bills",
        "Entertainment",
        "Health",
        "Other"
    ];

    if (!Number.isInteger(id) || id <= 0) { 
        return res.status(404).json({ message: "Expense not found" });
    }

    if (!title || typeof title !== "string" || title.trim() === "") { 
        return res.status(400).json({ message: "Title is required" });
    }

    if (Number(amount) <= 0 || !Number.isFinite(Number(amount))) {
        return res.status(400).json({
            message: "Amount must be a number greater than 0"
        });
    }

    if (!allowedCategories.includes(category)) {
        return res.status(400).json({
            message: "Invalid category"
        });
    }

    if (!date) {
        return res.status(400).json({
            message: "Date is required"
        });
    }

    try {
        const result = await pool.query(`
            UPDATE expenses
            SET title = $1,
                amount = $2,
                category = $3,
                date = $4
            WHERE id = $5
            RETURNING
                id,
                title,
                amount::float8 AS amount,
                category,
                to_char(date, 'YYYY-MM-DD') AS date
        `, [
            title.trim(),
            Number(amount),
            category,
            date,
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// DELETE expense
app.delete("/api/expenses/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(404).json({ message: "Expense not found" });
    }

    try {
        const result = await pool.query(`
            DELETE FROM expenses
            WHERE id = $1
            RETURNING id
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        res.status(200).json({
            message: "Expense deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});