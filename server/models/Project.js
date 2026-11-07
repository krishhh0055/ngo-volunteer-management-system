import archivePlugin from './plugins/archivePlugin.js';
import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true, default: 0 },
  raised: { type: Number, required: true, default: 0 },
  status: { type: String, required: true, default: 'Planning', enum: ['Planning', 'In Progress', 'Completed'] },
  priority: { type: String, required: true, default: 'Medium', enum: ['Low', 'Medium', 'High'] },
  endDate: { type: String },
  assignedStaff: [{ type: String }], // Array of User IDs (or names if migrating)
  progress: { type: Number, default: 0 }
}, { timestamps: true });


projectSchema.plugin(archivePlugin);
const Project = mongoose.model('Project', projectSchema);
export default Project;
