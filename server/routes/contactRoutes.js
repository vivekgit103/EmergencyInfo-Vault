const express = require('express');
const { body } = require('express-validator');
const {
  getContacts,
  createContact,
  updateContact,
  deleteContact
} = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

const createContactValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Contact name is required')
    .isLength({ max: 100 })
    .withMessage('Contact name cannot exceed 100 characters'),
  body('relationship')
    .trim()
    .notEmpty()
    .withMessage('Relationship is required')
    .isLength({ max: 50 })
    .withMessage('Relationship cannot exceed 50 characters'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{5,20}$/)
    .withMessage('Please enter a valid phone number (digits, optional +, hyphens, or parentheses)'),
  body('priority')
    .optional()
    .isIn(['primary', 'secondary', 'other'])
    .withMessage('Priority must be primary, secondary, or other'),
  body('showInEmergency')
    .optional()
    .isBoolean()
    .withMessage('showInEmergency must be a boolean')
];

const updateContactValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Contact name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Contact name cannot exceed 100 characters'),
  body('relationship')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Relationship cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Relationship cannot exceed 50 characters'),
  body('phone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Phone number cannot be empty')
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{5,20}$/)
    .withMessage('Please enter a valid phone number'),
  body('priority')
    .optional()
    .isIn(['primary', 'secondary', 'other'])
    .withMessage('Priority must be primary, secondary, or other'),
  body('showInEmergency')
    .optional()
    .isBoolean()
    .withMessage('showInEmergency must be a boolean')
];

// All contact routes are protected
router.use(protect);

router.route('/')
  .get(getContacts)
  .post(createContactValidation, validate, createContact);

router.route('/:id')
  .put(updateContactValidation, validate, updateContact)
  .delete(deleteContact);

module.exports = router;
