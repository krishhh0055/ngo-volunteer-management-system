import mongoose from 'mongoose';

const archiveSchema = new mongoose.Schema({
  originalCollection: {
    type: String,
    required: true
  },
  originalId: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  deletedAt: {
    type: Date,
    default: Date.now
  }
});

// Create model if it doesn't exist
const Archive = mongoose.models.Archive || mongoose.model('Archive', archiveSchema);

export default Archive;
