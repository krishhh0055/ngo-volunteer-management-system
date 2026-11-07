import archivePlugin from './plugins/archivePlugin.js';
import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String, // e.g. Admin Name
    required: true
  },
  priority: {
    type: String,
    enum: ['High', 'Normal', 'Low'],
    default: 'Normal'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


announcementSchema.plugin(archivePlugin);
export default mongoose.model('Announcement', announcementSchema);
