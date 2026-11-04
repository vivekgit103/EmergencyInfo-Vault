const express = require('express');
const { body } = require('express-validator');
const {
  getShareLinks,
  createShareLink,
  deleteShareLink
} = require('../controllers/shareLinkController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

const shareLinkValidation = [
  body('expiry')
    .optional()
    .isIn(['1h', '24h', '7d'])
    .withMessage('Expiry must be 1h, 24h, or 7d'),
  body('pin')
    .optional({ checkFalsy: true })
    .isLength({ min: 4, max: 8 })
    .withMessage('Optional PIN must be between 4 and 8 characters')
];

// All share-link management routes are protected
router.use(protect);

router.route('/')
  .get(getShareLinks)
  .post(shareLinkValidation, validate, createShareLink);

router.route('/:id')
  .delete(deleteShareLink);

module.exports = router;
