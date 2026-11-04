const mongoose = require('mongoose');

const instructionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Instruction title is required'],
      trim: true,
      maxlength: [60, 'Title cannot exceed 60 characters']
    },
    text: {
      type: String,
      required: [true, 'Instruction text is required'],
      trim: true,
      maxlength: [300, 'Text cannot exceed 300 characters']
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

module.exports = mongoose.model('Instruction', instructionSchema);
