import archivePlugin from './plugins/archivePlugin.js';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true, enum: ['admin', 'staff', 'volunteer'] },
  avatar: { type: String },
  volunteerType: { type: String, enum: ['Permanent', 'Temporary', 'Event-Specific', ''] },
  status: { type: String, enum: ['Active', 'Left'], default: 'Active' },
  joinDate: { type: String },
  leaveDate: { type: String },
  associatedEvent: { type: String }
}, { timestamps: true });


userSchema.plugin(archivePlugin);
const User = mongoose.model('User', userSchema);
export default User;
