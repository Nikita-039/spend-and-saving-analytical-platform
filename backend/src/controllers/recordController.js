const { validationResult } = require('express-validator');
const SpendRecord = require('../models/SpendRecord');

// @desc    Get all spend records (with filters, pagination, sorting)
// @route   GET /api/records
// @access  Private
const getRecords = async (req, res, next) => {
  try {
    const {
      startDate, endDate, businessUnit, department, category, vendor,
      location, status, priority, paymentMethod,
      search, page = 1, limit = 20, sortBy = 'date', sortOrder = 'desc',
    } = req.query;

    const filter = {};

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (businessUnit)   filter.businessUnit  = { $in: businessUnit.split(',') };
    if (department)     filter.department    = { $in: department.split(',') };
    if (category)       filter.category      = { $in: category.split(',') };
    if (vendor)         filter.vendor        = { $in: vendor.split(',') };
    if (location)       filter.location      = { $in: location.split(',') };
    if (status)         filter.status        = { $in: status.split(',') };
    if (priority)       filter.priority      = { $in: priority.split(',') };
    if (paymentMethod)  filter.paymentMethod = { $in: paymentMethod.split(',') };

    if (search) {
      filter.$or = [
        { vendor:       { $regex: search, $options: 'i' } },
        { businessUnit: { $regex: search, $options: 'i' } },
        { department:   { $regex: search, $options: 'i' } },
        { category:     { $regex: search, $options: 'i' } },
        { location:     { $regex: search, $options: 'i' } },
        { description:  { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [records, total] = await Promise.all([
      SpendRecord.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      SpendRecord.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: records,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Build a filter object from query params (reused for summary)
const buildFilter = (query) => {
  const {
    startDate, endDate, businessUnit, department, category,
    vendor, location, status, priority, paymentMethod,
  } = query;

  const filter = {};
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate)   filter.date.$lte = new Date(endDate);
  }
  if (businessUnit)   filter.businessUnit  = { $in: businessUnit.split(',') };
  if (department)     filter.department    = { $in: department.split(',') };
  if (category)       filter.category      = { $in: category.split(',') };
  if (vendor)         filter.vendor        = { $in: vendor.split(',') };
  if (location)       filter.location      = { $in: location.split(',') };
  if (status)         filter.status        = { $in: status.split(',') };
  if (priority)       filter.priority      = { $in: priority.split(',') };
  if (paymentMethod)  filter.paymentMethod = { $in: paymentMethod.split(',') };
  return filter;
};

// @desc    Get dashboard summary (KPIs + chart data)
// @route   GET /api/records/summary
// @access  Private
const getSummary = async (req, res, next) => {
  try {
    const filter = buildFilter(req.query);

    // KPI aggregation
    const [kpiAgg, byBusinessUnit, byCategory, byVendor, byStatus, byLocation, byDepartment, byPriority, trendByMonth] = await Promise.all([
      SpendRecord.aggregate([
        { $match: filter },
        { $group: {
          _id: null,
          totalBudget:     { $sum: '$budget' },
          totalActualSpend:{ $sum: '$actualSpend' },
          totalRecords:    { $sum: 1 },
          avgBudget:       { $avg: '$budget' },
          avgActualSpend:  { $avg: '$actualSpend' },
        }},
      ]),

      SpendRecord.aggregate([
        { $match: filter },
        { $group: { _id: '$businessUnit', totalBudget: { $sum: '$budget' }, totalActualSpend: { $sum: '$actualSpend' }, count: { $sum: 1 } }},
        { $sort: { totalActualSpend: -1 } },
      ]),

      SpendRecord.aggregate([
        { $match: filter },
        { $group: { _id: '$category', totalBudget: { $sum: '$budget' }, totalActualSpend: { $sum: '$actualSpend' }, count: { $sum: 1 } }},
        { $sort: { totalActualSpend: -1 } },
      ]),

      SpendRecord.aggregate([
        { $match: filter },
        { $group: { _id: '$vendor', totalActualSpend: { $sum: '$actualSpend' }, count: { $sum: 1 } }},
        { $sort: { totalActualSpend: -1 } },
        { $limit: 10 },
      ]),

      SpendRecord.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 }, totalActualSpend: { $sum: '$actualSpend' } }},
      ]),

      SpendRecord.aggregate([
        { $match: filter },
        { $group: { _id: '$location', totalActualSpend: { $sum: '$actualSpend' }, totalBudget: { $sum: '$budget' }, count: { $sum: 1 } }},
        { $sort: { totalActualSpend: -1 } },
      ]),

      SpendRecord.aggregate([
        { $match: filter },
        { $group: { _id: '$department', totalBudget: { $sum: '$budget' }, totalActualSpend: { $sum: '$actualSpend' }, count: { $sum: 1 } }},
        { $sort: { totalActualSpend: -1 } },
      ]),

      SpendRecord.aggregate([
        { $match: filter },
        { $group: { _id: '$priority', count: { $sum: 1 }, totalActualSpend: { $sum: '$actualSpend' } }},
      ]),

      SpendRecord.aggregate([
        { $match: filter },
        { $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          totalBudget: { $sum: '$budget' }, totalActualSpend: { $sum: '$actualSpend' }, count: { $sum: 1 },
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    const kpi = kpiAgg[0] || { totalBudget: 0, totalActualSpend: 0, totalRecords: 0, avgBudget: 0, avgActualSpend: 0 };
    kpi.totalSavings   = kpi.totalBudget - kpi.totalActualSpend;
    kpi.savingsPercent = kpi.totalBudget > 0 ? parseFloat(((kpi.totalSavings / kpi.totalBudget) * 100).toFixed(2)) : 0;
    kpi.topVendor   = byVendor[0]?._id  || 'N/A';
    kpi.topCategory = byCategory[0]?._id || 'N/A';
    kpi.topBU       = byBusinessUnit[0]?._id || 'N/A';

    res.json({
      success: true,
      data: { kpi, byBusinessUnit, byCategory, byVendor, byStatus, byLocation, byDepartment, byPriority, trendByMonth },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create spend record
// @route   POST /api/records
// @access  Private
const createRecord = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    // Auto-assign recordId
    const last = await SpendRecord.findOne().sort({ recordId: -1 });
    const nextId = last?.recordId ? last.recordId + 1 : 1001;

    const record = await SpendRecord.create({ ...req.body, recordId: nextId });
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Update spend record
// @route   PUT /api/records/:id
// @access  Private
const updateRecord = async (req, res, next) => {
  try {
    let record = await SpendRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

    record = await SpendRecord.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete spend record
// @route   DELETE /api/records/:id
// @access  Private
const deleteRecord = async (req, res, next) => {
  try {
    const record = await SpendRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

    await SpendRecord.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get filter dropdown options
// @route   GET /api/records/options
// @access  Private
const getOptions = async (req, res, next) => {
  try {
    const [businessUnits, departments, categories, vendors, locations, statuses, priorities, paymentMethods] = await Promise.all([
      SpendRecord.distinct('businessUnit'),
      SpendRecord.distinct('department'),
      SpendRecord.distinct('category'),
      SpendRecord.distinct('vendor'),
      SpendRecord.distinct('location'),
      SpendRecord.distinct('status'),
      SpendRecord.distinct('priority'),
      SpendRecord.distinct('paymentMethod'),
    ]);

    res.json({
      success: true,
      data: { businessUnits, departments, categories, vendors, locations, statuses, priorities, paymentMethods },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRecords, getSummary, createRecord, updateRecord, deleteRecord, getOptions };
