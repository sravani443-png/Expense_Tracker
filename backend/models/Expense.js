// const mongoose = require("mongoose");

// const transactionSchema = new mongoose.Schema(
//     {
//         description: { type: String, required: true, trim: true },
//         amount: { type: Number, required: true, min: 0.01 },
//         type: { type: String, enum: ["income", "expense"], default: "expense" },
//         category: { type: String, required: true, trim: true, default: "General" },
//         date: { type: Date, default: Date.now },
//     },
//     { timestamps: true }
// );

// module.exports = mongoose.model("Transaction", transactionSchema);






const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  category: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', ExpenseSchema);
