import archivePlugin from './plugins/archivePlugin.js';
import mongoose from 'mongoose';

const fundSchema = new mongoose.Schema({
  totalRaised: { type: Number, required: true, default: 0 },
  target: { type: Number, required: true, default: 200000 },
  recentDonations: [{
    donor: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    project: { type: String }
  }]
}, { timestamps: true });


fundSchema.plugin(archivePlugin);
const Fund = mongoose.model('Fund', fundSchema);
export default Fund;
