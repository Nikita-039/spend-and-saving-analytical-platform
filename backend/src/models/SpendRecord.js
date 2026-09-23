const mongoose = require('mongoose');

const SpendRecordSchema = new mongoose.Schema(
  {
    recordId: {
      type: Number,
      unique: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: ['IT', 'Procurement', 'Marketing', 'Finance', 'HR', 'Operations', 'Sales', 'Facilities'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    vendor: {
      type: String,
      required: [true, 'Vendor is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      enum: ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad'],
      trim: true,
    },
    businessUnit: {
      type: String,
      required: [true, 'Business Unit is required'],
      enum: ['Technology', 'Corporate', 'Marketing', 'Finance', 'People', 'Operations', 'Sales'],
      trim: true,
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [0, 'Budget cannot be negative'],
    },
    actualSpend: {
      type: Number,
      required: [true, 'Actual Spend is required'],
      min: [0, 'Actual Spend cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Approved', 'Over Budget', 'Pending', 'Rejected'],
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    paymentMethod: {
      type: String,
      enum: ['Monthly', 'Purchase Order', 'Project', 'Annual Contract', 'Corporate Card'],
      default: 'Monthly',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: Savings
SpendRecordSchema.virtual('savings').get(function () {
  return parseFloat((this.budget - this.actualSpend).toFixed(2));
});

// Virtual: Savings Percentage
SpendRecordSchema.virtual('savingsPercent').get(function () {
  if (this.budget === 0) return 0;
  return parseFloat((((this.budget - this.actualSpend) / this.budget) * 100).toFixed(2));
});

// Indexes
SpendRecordSchema.index({ date: -1 });
SpendRecordSchema.index({ department: 1 });
SpendRecordSchema.index({ businessUnit: 1 });
SpendRecordSchema.index({ status: 1 });
SpendRecordSchema.index({ priority: 1 });

module.exports = mongoose.model('SpendRecord', SpendRecordSchema);
