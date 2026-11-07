const Instruction = require('../models/Instruction');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get all instructions for current user
 * @route   GET /api/instructions
 * @access  Private
 */
const getInstructions = asyncHandler(async (req, res) => {
  const instructions = await Instruction.find({ userId: req.user._id }).sort({ createdAt: 1 });

  res.status(200).json({
    instructions
  });
});

/**
 * @desc    Create a new emergency instruction
 * @route   POST /api/instructions
 * @access  Private
 */
const createInstruction = asyncHandler(async (req, res) => {
  const existingCount = await Instruction.countDocuments({ userId: req.user._id });
  if (existingCount >= 20) {
    return res.status(400).json({
      message: 'Maximum limit of 20 instructions reached. Please remove an existing instruction before adding a new one.'
    });
  }

  const { title, text, showInEmergency } = req.body;

  const instruction = await Instruction.create({
    userId: req.user._id,
    title,
    text,
    showInEmergency: typeof showInEmergency === 'boolean' ? showInEmergency : true
  });

  res.status(201).json({
    message: 'Instruction created successfully',
    instruction
  });
});

/**
 * @desc    Update an instruction
 * @route   PUT /api/instructions/:id
 * @access  Private
 */
const updateInstruction = asyncHandler(async (req, res) => {
  const instruction = await Instruction.findOne({ _id: req.params.id, userId: req.user._id });

  if (!instruction) {
    return res.status(404).json({
      message: 'Instruction not found or you do not have permission to edit it'
    });
  }

  const { title, text, showInEmergency } = req.body;

  if (title !== undefined) instruction.title = title;
  if (text !== undefined) instruction.text = text;
  if (typeof showInEmergency === 'boolean') instruction.showInEmergency = showInEmergency;

  const updatedInstruction = await instruction.save();

  res.status(200).json({
    message: 'Instruction updated successfully',
    instruction: updatedInstruction
  });
});

/**
 * @desc    Delete an instruction
 * @route   DELETE /api/instructions/:id
 * @access  Private
 */
const deleteInstruction = asyncHandler(async (req, res) => {
  const instruction = await Instruction.findOne({ _id: req.params.id, userId: req.user._id });

  if (!instruction) {
    return res.status(404).json({
      message: 'Instruction not found or you do not have permission to delete it'
    });
  }

  await Instruction.deleteOne({ _id: instruction._id });

  res.status(200).json({
    message: 'Instruction removed successfully',
    id: req.params.id
  });
});

module.exports = {
  getInstructions,
  createInstruction,
  updateInstruction,
  deleteInstruction
};
