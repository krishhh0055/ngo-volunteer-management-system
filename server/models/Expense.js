import archivePlugin from './plugins/archivePlugin.js';
import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  projectId: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  addedBy: { type: String, required: true } // User ID or Name
}, { timestamps: true });


expenseSchema.plugin(archivePlugin);
const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
