const express = require('express');
const { body } = require('express-validator');
const { deleteAccount } = require('../controllers/accountController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

const deleteAccountValidation = [
  body('password')
    .notEmpty()
    .withMessage('Password is required to confirm account deletion')
];

router.delete('/', protect, deleteAccountValidation, validate, deleteAccount);

module.exports = router;
