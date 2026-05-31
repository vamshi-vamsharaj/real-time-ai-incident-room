import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title must be at most 200 characters'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description must be at most 2000 characters'],
      trim: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: [true, 'Priority is required'],
    },
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved'],
      default: 'open',
    },
    reporter_name: {
      type: String,
      required: [true, 'Reporter name is required'],
      minlength: [2, 'Reporter name must be at least 2 characters'],
      maxlength: [100, 'Reporter name must be at most 100 characters'],
      trim: true,
    },
    latest_update: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

incidentSchema.index({ status: 1, priority: 1, updated_at: -1 });
incidentSchema.index({ title: 'text' });

const Incident = mongoose.model('Incident', incidentSchema);

export default Incident;