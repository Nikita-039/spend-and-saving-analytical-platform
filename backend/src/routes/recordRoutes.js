const express = require('express');
const { body } = require('express-validator');
const {
  getRecords, getSummary, createRecord, updateRecord, deleteRecord, getOptions,
} = require('../controllers/recordController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes protected
router.use(protect);

const recordValidation = [
  body('date').notEmpty().withMessage('Date is required').isISO8601().withMessage('Invalid date format'),
  body('businessUnit').notEmpty().withMessage('Business Unit is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('vendor').notEmpty().withMessage('Vendor is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('budget').isNumeric().withMessage('Budget must be a number').custom(v => v >= 0).withMessage('Budget cannot be negative'),
  body('actualSpend').isNumeric().withMessage('Actual Spend must be a number').custom(v => v >= 0).withMessage('Actual Spend cannot be negative'),
];

router.get('/summary', getSummary);
router.get('/options', getOptions);
router.get('/', getRecords);
router.post('/', recordValidation, createRecord);
router.put('/:id', updateRecord);
router.delete('/:id', deleteRecord);

module.exports = router;
