// const express = require("express");
// const mongoose = require("mongoose");
// const Transaction = require("../models/Transaction");

// module.exports = function createTransactionRoutes(memoryTransactions) {
//     const router = express.Router();

//     const isMongoReady = () => mongoose.connection.readyState === 1;

//     router.get("/", async (req, res) => {
//         if (isMongoReady()) {
//             try {
//                 const transactions = await Transaction.find().sort({ date: -1, createdAt: -1 });
//                 return res.json(transactions);
//             } catch (error) {
//                 return res.status(500).json({ message: error.message });
//             }
//         }

//         return res.json([...memoryTransactions].sort((a, b) => new Date(b.date) - new Date(a.date)));
//     });

//     router.post("/", async (req, res) => {
//         const { description, amount, type, category, date } = req.body;
//         const numericAmount = Number(amount);

//         if (!description || amount === undefined || !type) {
//             return res.status(400).json({ message: "Please provide description, amount, and type." });
//         }

//         if (!["income", "expense"].includes(type)) {
//             return res.status(400).json({ message: "Type must be income or expense." });
//         }

//         if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
//             return res.status(400).json({ message: "Amount must be greater than 0." });
//         }

//         const transactionData = {
//             description: description.trim(),
//             amount: numericAmount,
//             type,
//             category: category?.trim() || "General",
//             date: date ? new Date(date) : new Date(),
//         };

//         if (isMongoReady()) {
//             try {
//                 const transaction = await Transaction.create(transactionData);
//                 return res.status(201).json(transaction);
//             } catch (error) {
//                 return res.status(500).json({ message: error.message });
//             }
//         }

//         const transaction = { ...transactionData, _id: `${Date.now()}-${Math.random().toString(16).slice(2)}` };
//         memoryTransactions.unshift(transaction);
//         return res.status(201).json(transaction);
//     });

//     router.delete("/:id", async (req, res) => {
//         if (isMongoReady()) {
//             try {
//                 const deleted = await Transaction.findByIdAndDelete(req.params.id);
//                 if (!deleted) {
//                     return res.status(404).json({ message: "Transaction not found" });
//                 }
//                 return res.json({ message: "Transaction deleted" });
//             } catch (error) {
//                 return res.status(500).json({ message: error.message });
//             }
//         }

//         const index = memoryTransactions.findIndex((item) => item._id === req.params.id);
//         if (index === -1) {
//             return res.status(404).json({ message: "Transaction not found" });
//         }

//         memoryTransactions.splice(index, 1);
//         return res.json({ message: "Transaction deleted" });
//     });

//     return router;
// };






const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// GET all expenses
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new expense
router.post('/', async (req, res) => {
  const expense = new Expense({
    description: req.body.description,
    amount: req.body.amount,
    category: req.body.category
  });
  try {
    const newExpense = await expense.save();
    res.status(201).json(newExpense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

