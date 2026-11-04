const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    relationship: {
      type: String,
      required: [true, 'Relationship is required'],
      trim: true,
      maxlength: [50, 'Relationship cannot exceed 50 characters']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [30, 'Phone cannot exceed 30 characters']
    },
    priority: {
      type: String,
      enum: {
        values: ['primary', 'secondary', 'other'],
        message: 'Priority must be primary, secondary, or other'
      },
      default: 'primary'
    },
    showInEmergency: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Index to sort by priority and name efficiently
contactSchema.index({ userId: 1, priority: 1 });

module.exports = mongoose.model('Contact', contactSchema);
