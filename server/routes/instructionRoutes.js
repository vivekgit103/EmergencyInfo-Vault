const express = require('express');
const { body } = require('express-validator');
const {
  getInstructions,
  createInstruction,
  updateInstruction,
  deleteInstruction
} = require('../controllers/instructionController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const sensitiveDataGuard = require('../middleware/sensitiveDataGuard');

const router = express.Router();

const createInstructionValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 60 })
    .withMessage('Title cannot exceed 60 characters'),
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Instruction text is required')
    .isLength({ max: 300 })
    .withMessage('Instruction text cannot exceed 300 characters'),
  body('showInEmergency')
    .optional()
    .isBoolean({ strict: true })
    .withMessage('showInEmergency must be a boolean (true or false)')
];

const updateInstructionValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 60 })
    .withMessage('Title cannot exceed 60 characters'),
  body('text')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Instruction text cannot be empty')
    .isLength({ max: 300 })
    .withMessage('Instruction text cannot exceed 300 characters'),
  body('showInEmergency')
    .optional()
    .isBoolean({ strict: true })
    .withMessage('showInEmergency must be a boolean (true or false)')
];

// All instruction routes are protected
router.use(protect);

router.route('/')
  .get(getInstructions)
  .post(createInstructionValidation, validate, sensitiveDataGuard, createInstruction);

router.route('/:id')
  .put(updateInstructionValidation, validate, sensitiveDataGuard, updateInstruction)
  .delete(deleteInstruction);

module.exports = router;
