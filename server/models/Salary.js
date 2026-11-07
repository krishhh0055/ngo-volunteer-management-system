import archivePlugin from './plugins/archivePlugin.js';
import mongoose from 'mongoose';

const salarySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'staff', 'volunteer'] },
  amount: { type: Number, required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
  status: { type: String, required: true, default: 'Pending', enum: ['Pending', 'Paid'] },
  paidDate: { type: String }
}, { timestamps: true });


salarySchema.plugin(archivePlugin);
const Salary = mongoose.model('Salary', salarySchema);
export default Salary;
