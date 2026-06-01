import mongoose from 'mongoose';

const updateSchema = new mongoose.Schema(
  {
    incident_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident',
      required: [true, 'incident_id is required'],
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      minlength: [1, 'Message cannot be empty'],
      maxlength: [1000, 'Message must be at most 1000 characters'],
      trim: true,
    },
    author_name: {
      type: String,
      required: [true, 'Author name is required'],
      minlength: [2, 'Author name must be at least 2 characters'],
      maxlength: [100, 'Author name must be at most 100 characters'],
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

// Critical index — every "load updates for incident X" query hits this
updateSchema.index({ incident_id: 1, created_at: -1 });

const Update = mongoose.model('Update', updateSchema);

export default Update;