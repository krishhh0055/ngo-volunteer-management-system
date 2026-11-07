import archivePlugin from './plugins/archivePlugin.js';
import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Fundraiser', 'Workshop', 'Drive', 'Meeting', 'Other'],
    default: 'Other'
  },
  registrants: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});


eventSchema.plugin(archivePlugin);
export default mongoose.model('Event', eventSchema);
