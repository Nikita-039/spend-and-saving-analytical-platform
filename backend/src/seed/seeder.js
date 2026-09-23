require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const SpendRecord = require('../models/SpendRecord');
const connectDB = require('../config/db');

// ============================================================
// REAL DATA — Based on Assignment_Data_Spend&Saving.xlsx
// ============================================================
const excelRecords = [
  { recordId: 1001, date: '2026-01-08', department: 'IT',          category: 'Cloud Infrastructure',  vendor: 'Microsoft Azure',      location: 'Bengaluru', businessUnit: 'Technology', budget: 185000, actualSpend: 162400, status: 'Approved',    priority: 'High',   paymentMethod: 'Monthly' },
  { recordId: 1002, date: '2026-01-07', department: 'Procurement',  category: 'Office Supplies',        vendor: 'Staples',              location: 'Mumbai',    businessUnit: 'Corporate',  budget: 42000,  actualSpend: 36750,  status: 'Approved',    priority: 'Medium', paymentMethod: 'Purchase Order' },
  { recordId: 1003, date: '2026-01-11', department: 'Marketing',    category: 'Digital Advertising',    vendor: 'Google Ads',           location: 'Delhi NCR', businessUnit: 'Marketing',  budget: 125000, actualSpend: 113800, status: 'Approved',    priority: 'High',   paymentMethod: 'Monthly' },
  { recordId: 1004, date: '2026-01-16', department: 'Finance',      category: 'Consulting',             vendor: 'Deloitte',             location: 'Mumbai',    businessUnit: 'Finance',    budget: 210000, actualSpend: 198500, status: 'Approved',    priority: 'High',   paymentMethod: 'Project' },
  { recordId: 1005, date: '2026-01-22', department: 'HR',           category: 'Recruitment',            vendor: 'LinkedIn',             location: 'Bengaluru', businessUnit: 'People',     budget: 68000,  actualSpend: 54200,  status: 'Approved',    priority: 'Medium', paymentMethod: 'Annual Contract' },
  { recordId: 1006, date: '2026-01-28', department: 'Operations',   category: 'Travel',                 vendor: 'Corporate Travel Co.', location: 'Hyderabad', businessUnit: 'Operations', budget: 95000,  actualSpend: 102300, status: 'Over Budget', priority: 'Medium', paymentMethod: 'Corporate Card' },
  { recordId: 1007, date: '2026-02-03', department: 'IT',           category: 'Software Licenses',      vendor: 'Adobe',                location: 'Chennai',   businessUnit: 'Technology', budget: 78000,  actualSpend: 69400,  status: 'Approved',    priority: 'Medium', paymentMethod: 'Annual Contract' },
  { recordId: 1008, date: '2026-02-09', department: 'Facilities',   category: 'Maintenance',            vendor: 'CBRE',                 location: 'Pune',      businessUnit: 'Corporate',  budget: 145000, actualSpend: 121600, status: 'Approved',    priority: 'High',   paymentMethod: 'Purchase Order' },
  { recordId: 1009, date: '2026-02-14', department: 'Sales',        category: 'Events',                 vendor: 'EventWorks',           location: 'Mumbai',    businessUnit: 'Sales',      budget: 160000, actualSpend: 139500, status: 'Approved',    priority: 'High',   paymentMethod: 'Project' },
  { recordId: 1010, date: '2026-02-21', department: 'Procurement',  category: 'Hardware',               vendor: 'Dell Technologies',    location: 'Chennai',   businessUnit: 'Technology', budget: 320000, actualSpend: 287800, status: 'Approved',    priority: 'High',   paymentMethod: 'Purchase Order' },
  { recordId: 1011, date: '2026-03-02', department: 'Marketing',    category: 'Content Services',       vendor: 'ContentHub',           location: 'Hyderabad', businessUnit: 'Marketing',  budget: 85000,  actualSpend: 91800,  status: 'Over Budget', priority: 'Medium', paymentMethod: 'Project' },
  { recordId: 1012, date: '2026-03-08', department: 'IT',           category: 'Cloud Infrastructure',   vendor: 'Amazon Web Services',  location: 'Pune',      businessUnit: 'Technology', budget: 240000, actualSpend: 211700, status: 'Approved',    priority: 'High',   paymentMethod: 'Monthly' },
  { recordId: 1013, date: '2026-03-15', department: 'Finance',      category: 'Software',               vendor: 'Oracle',               location: 'Delhi NCR', businessUnit: 'Finance',    budget: 175000, actualSpend: 151200, status: 'Approved',    priority: 'High',   paymentMethod: 'Annual Contract' },
  { recordId: 1014, date: '2026-03-19', department: 'HR',           category: 'Employee Training',      vendor: 'SkillPro',             location: 'Chennai',   businessUnit: 'People',     budget: 72000,  actualSpend: 58300,  status: 'Approved',    priority: 'Low',    paymentMethod: 'Project' },
  { recordId: 1015, date: '2026-03-26', department: 'Operations',   category: 'Logistics',              vendor: 'BlueDart',             location: 'Mumbai',    businessUnit: 'Operations', budget: 135000, actualSpend: 126400, status: 'Approved',    priority: 'Medium', paymentMethod: 'Purchase Order' },
  { recordId: 1016, date: '2026-04-03', department: 'IT',           category: 'Cybersecurity',          vendor: 'CrowdStrike',          location: 'Bengaluru', businessUnit: 'Technology', budget: 195000, actualSpend: 171900, status: 'Approved',    priority: 'High',   paymentMethod: 'Annual Contract' },
  { recordId: 1017, date: '2026-04-10', department: 'Sales',        category: 'Travel',                 vendor: 'Corporate Travel Co.', location: 'Pune',      businessUnit: 'Sales',      budget: 110000, actualSpend: 97400,  status: 'Approved',    priority: 'Medium', paymentMethod: 'Corporate Card' },
  { recordId: 1018, date: '2026-04-17', department: 'Marketing',    category: 'Digital Advertising',    vendor: 'Meta Ads',             location: 'Hyderabad', businessUnit: 'Marketing',  budget: 140000, actualSpend: 128600, status: 'Approved',    priority: 'High',   paymentMethod: 'Monthly' },
  { recordId: 1019, date: '2026-04-23', department: 'Facilities',   category: 'Utilities',              vendor: 'Tata Power',           location: 'Delhi NCR', businessUnit: 'Corporate',  budget: 88000,  actualSpend: 93400,  status: 'Over Budget', priority: 'Medium', paymentMethod: 'Monthly' },
  { recordId: 1020, date: '2026-04-29', department: 'Procurement',  category: 'Hardware',               vendor: 'HP Enterprise',        location: 'Bengaluru', businessUnit: 'Technology', budget: 275000, actualSpend: 231500, status: 'Approved',    priority: 'High',   paymentMethod: 'Purchase Order' },
  // Extended records (same schema, realistic data)
  { recordId: 1021, date: '2026-05-05', department: 'IT',           category: 'Software Licenses',      vendor: 'Microsoft Azure',      location: 'Pune',      businessUnit: 'Technology', budget: 155000, actualSpend: 148200, status: 'Approved',    priority: 'High',   paymentMethod: 'Annual Contract' },
  { recordId: 1022, date: '2026-05-10', department: 'HR',           category: 'Recruitment',            vendor: 'Naukri.com',           location: 'Mumbai',    businessUnit: 'People',     budget: 55000,  actualSpend: 47600,  status: 'Approved',    priority: 'Medium', paymentMethod: 'Monthly' },
  { recordId: 1023, date: '2026-05-14', department: 'Marketing',    category: 'Events',                 vendor: 'EventWorks',           location: 'Bengaluru', businessUnit: 'Marketing',  budget: 200000, actualSpend: 188500, status: 'Approved',    priority: 'High',   paymentMethod: 'Project' },
  { recordId: 1024, date: '2026-05-19', department: 'Finance',      category: 'Consulting',             vendor: 'KPMG',                 location: 'Delhi NCR', businessUnit: 'Finance',    budget: 180000, actualSpend: 193200, status: 'Over Budget', priority: 'High',   paymentMethod: 'Project' },
  { recordId: 1025, date: '2026-05-24', department: 'Operations',   category: 'Logistics',              vendor: 'DHL Express',          location: 'Chennai',   businessUnit: 'Operations', budget: 98000,  actualSpend: 89700,  status: 'Approved',    priority: 'Medium', paymentMethod: 'Purchase Order' },
  { recordId: 1026, date: '2026-05-28', department: 'Sales',        category: 'CRM Software',           vendor: 'Salesforce',           location: 'Hyderabad', businessUnit: 'Sales',      budget: 265000, actualSpend: 265000, status: 'Approved',    priority: 'High',   paymentMethod: 'Annual Contract' },
  { recordId: 1027, date: '2026-06-03', department: 'IT',           category: 'Cloud Infrastructure',   vendor: 'Google Cloud',         location: 'Bengaluru', businessUnit: 'Technology', budget: 310000, actualSpend: 287400, status: 'Approved',    priority: 'High',   paymentMethod: 'Monthly' },
  { recordId: 1028, date: '2026-06-09', department: 'Facilities',   category: 'Maintenance',            vendor: 'JLL India',            location: 'Mumbai',    businessUnit: 'Corporate',  budget: 120000, actualSpend: 115800, status: 'Approved',    priority: 'Medium', paymentMethod: 'Purchase Order' },
  { recordId: 1029, date: '2026-06-14', department: 'Procurement',  category: 'Office Supplies',        vendor: 'Staples',              location: 'Pune',      businessUnit: 'Corporate',  budget: 38000,  actualSpend: 41200,  status: 'Over Budget', priority: 'Low',    paymentMethod: 'Purchase Order' },
  { recordId: 1030, date: '2026-06-19', department: 'Marketing',    category: 'Digital Advertising',    vendor: 'Google Ads',           location: 'Delhi NCR', businessUnit: 'Marketing',  budget: 165000, actualSpend: 152300, status: 'Approved',    priority: 'High',   paymentMethod: 'Monthly' },
  { recordId: 1031, date: '2026-06-24', department: 'HR',           category: 'Employee Training',      vendor: 'Coursera Business',    location: 'Chennai',   businessUnit: 'People',     budget: 85000,  actualSpend: 76400,  status: 'Approved',    priority: 'Medium', paymentMethod: 'Annual Contract' },
  { recordId: 1032, date: '2026-06-28', department: 'Finance',      category: 'Software',               vendor: 'SAP India',            location: 'Hyderabad', businessUnit: 'Finance',    budget: 420000, actualSpend: 395000, status: 'Approved',    priority: 'High',   paymentMethod: 'Annual Contract' },
  { recordId: 1033, date: '2026-07-05', department: 'Operations',   category: 'Travel',                 vendor: 'Corporate Travel Co.', location: 'Bengaluru', businessUnit: 'Operations', budget: 75000,  actualSpend: 68900,  status: 'Approved',    priority: 'Medium', paymentMethod: 'Corporate Card' },
  { recordId: 1034, date: '2026-07-11', department: 'IT',           category: 'Cybersecurity',          vendor: 'Palo Alto Networks',   location: 'Mumbai',    businessUnit: 'Technology', budget: 280000, actualSpend: 274600, status: 'Approved',    priority: 'High',   paymentMethod: 'Annual Contract' },
  { recordId: 1035, date: '2026-07-16', department: 'Sales',        category: 'Events',                 vendor: 'Wizcraft',             location: 'Delhi NCR', businessUnit: 'Sales',      budget: 220000, actualSpend: 234100, status: 'Over Budget', priority: 'High',   paymentMethod: 'Project' },
  { recordId: 1036, date: '2026-07-21', department: 'Marketing',    category: 'Content Services',       vendor: 'Dentsu India',         location: 'Pune',      businessUnit: 'Marketing',  budget: 110000, actualSpend: 104800, status: 'Approved',    priority: 'Medium', paymentMethod: 'Project' },
  { recordId: 1037, date: '2026-07-25', department: 'Procurement',  category: 'Hardware',               vendor: 'Lenovo India',         location: 'Chennai',   businessUnit: 'Technology', budget: 380000, actualSpend: 361200, status: 'Approved',    priority: 'High',   paymentMethod: 'Purchase Order' },
  { recordId: 1038, date: '2026-07-30', department: 'Finance',      category: 'Consulting',             vendor: 'EY India',             location: 'Hyderabad', businessUnit: 'Finance',    budget: 195000, actualSpend: 195000, status: 'Approved',    priority: 'High',   paymentMethod: 'Project' },
  { recordId: 1039, date: '2026-08-06', department: 'HR',           category: 'Recruitment',            vendor: 'Indeed India',         location: 'Bengaluru', businessUnit: 'People',     budget: 62000,  actualSpend: 58100,  status: 'Approved',    priority: 'Medium', paymentMethod: 'Monthly' },
  { recordId: 1040, date: '2026-08-12', department: 'Facilities',   category: 'Utilities',              vendor: 'BSES Rajdhani',        location: 'Delhi NCR', businessUnit: 'Corporate',  budget: 92000,  actualSpend: 97800,  status: 'Over Budget', priority: 'Low',    paymentMethod: 'Monthly' },
  { recordId: 1041, date: '2026-08-17', department: 'IT',           category: 'Cloud Infrastructure',   vendor: 'Amazon Web Services',  location: 'Pune',      businessUnit: 'Technology', budget: 295000, actualSpend: 267300, status: 'Approved',    priority: 'High',   paymentMethod: 'Monthly' },
  { recordId: 1042, date: '2026-08-21', department: 'Operations',   category: 'Logistics',              vendor: 'FedEx India',          location: 'Mumbai',    businessUnit: 'Operations', budget: 148000, actualSpend: 139600, status: 'Approved',    priority: 'Medium', paymentMethod: 'Purchase Order' },
  { recordId: 1043, date: '2026-08-26', department: 'Marketing',    category: 'Digital Advertising',    vendor: 'Meta Ads',             location: 'Bengaluru', businessUnit: 'Marketing',  budget: 190000, actualSpend: 178400, status: 'Approved',    priority: 'High',   paymentMethod: 'Monthly' },
  { recordId: 1044, date: '2026-08-30', department: 'Sales',        category: 'Travel',                 vendor: 'MakeMyTrip Business',  location: 'Chennai',   businessUnit: 'Sales',      budget: 85000,  actualSpend: 79200,  status: 'Approved',    priority: 'Medium', paymentMethod: 'Corporate Card' },
  { recordId: 1045, date: '2026-09-05', department: 'Finance',      category: 'Software',               vendor: 'Zoho Corp',            location: 'Hyderabad', businessUnit: 'Finance',    budget: 145000, actualSpend: 138700, status: 'Approved',    priority: 'High',   paymentMethod: 'Annual Contract' },
  { recordId: 1046, date: '2026-09-10', department: 'Procurement',  category: 'Office Supplies',        vendor: 'Amazon Business',      location: 'Delhi NCR', businessUnit: 'Corporate',  budget: 55000,  actualSpend: 52400,  status: 'Approved',    priority: 'Low',    paymentMethod: 'Purchase Order' },
  { recordId: 1047, date: '2026-09-14', department: 'IT',           category: 'Software Licenses',      vendor: 'Atlassian',            location: 'Bengaluru', businessUnit: 'Technology', budget: 175000, actualSpend: 175000, status: 'Approved',    priority: 'High',   paymentMethod: 'Annual Contract' },
  { recordId: 1048, date: '2026-09-18', department: 'HR',           category: 'Employee Training',      vendor: 'LinkedIn Learning',    location: 'Mumbai',    businessUnit: 'People',     budget: 78000,  actualSpend: 71500,  status: 'Approved',    priority: 'Medium', paymentMethod: 'Annual Contract' },
  { recordId: 1049, date: '2026-09-20', department: 'Operations',   category: 'Maintenance',            vendor: 'CBRE India',           location: 'Pune',      businessUnit: 'Operations', budget: 165000, actualSpend: 172400, status: 'Over Budget', priority: 'High',   paymentMethod: 'Purchase Order' },
  { recordId: 1050, date: '2026-09-21', department: 'Marketing',    category: 'Content Services',       vendor: 'Ogilvy India',         location: 'Delhi NCR', businessUnit: 'Marketing',  budget: 250000, actualSpend: 238900, status: 'Approved',    priority: 'High',   paymentMethod: 'Project' },
  // Additional records for richer analytics
  { recordId: 1051, date: '2026-01-15', department: 'Sales',        category: 'CRM Software',           vendor: 'HubSpot',              location: 'Hyderabad', businessUnit: 'Sales',      budget: 130000, actualSpend: 122800, status: 'Approved',    priority: 'High',   paymentMethod: 'Annual Contract' },
  { recordId: 1052, date: '2026-02-01', department: 'IT',           category: 'Cloud Infrastructure',   vendor: 'Microsoft Azure',      location: 'Chennai',   businessUnit: 'Technology', budget: 220000, actualSpend: 201400, status: 'Approved',    priority: 'High',   paymentMethod: 'Monthly' },
  { recordId: 1053, date: '2026-02-18', department: 'Facilities',   category: 'Maintenance',            vendor: 'Jones Lang LaSalle',   location: 'Bengaluru', businessUnit: 'Corporate',  budget: 180000, actualSpend: 165800, status: 'Approved',    priority: 'Medium', paymentMethod: 'Purchase Order' },
  { recordId: 1054, date: '2026-03-05', department: 'Marketing',    category: 'Events',                 vendor: 'Percept D\'Mark',      location: 'Mumbai',    businessUnit: 'Marketing',  budget: 340000, actualSpend: 358200, status: 'Over Budget', priority: 'High',   paymentMethod: 'Project' },
  { recordId: 1055, date: '2026-03-22', department: 'Procurement',  category: 'Hardware',               vendor: 'Apple India',          location: 'Pune',      businessUnit: 'Technology', budget: 450000, actualSpend: 432000, status: 'Approved',    priority: 'High',   paymentMethod: 'Purchase Order' },
  { recordId: 1056, date: '2026-04-08', department: 'Finance',      category: 'Consulting',             vendor: 'PwC India',            location: 'Delhi NCR', businessUnit: 'Finance',    budget: 290000, actualSpend: 278500, status: 'Approved',    priority: 'High',   paymentMethod: 'Project' },
  { recordId: 1057, date: '2026-04-20', department: 'HR',           category: 'Recruitment',            vendor: 'ManpowerGroup',        location: 'Chennai',   businessUnit: 'People',     budget: 95000,  actualSpend: 88400,  status: 'Approved',    priority: 'Medium', paymentMethod: 'Monthly' },
  { recordId: 1058, date: '2026-05-07', department: 'Operations',   category: 'Travel',                 vendor: 'Yatra Business',       location: 'Hyderabad', businessUnit: 'Operations', budget: 72000,  actualSpend: 68200,  status: 'Approved',    priority: 'Low',    paymentMethod: 'Corporate Card' },
  { recordId: 1059, date: '2026-05-15', department: 'IT',           category: 'Cybersecurity',          vendor: 'Sophos',               location: 'Bengaluru', businessUnit: 'Technology', budget: 155000, actualSpend: 162300, status: 'Over Budget', priority: 'High',   paymentMethod: 'Annual Contract' },
  { recordId: 1060, date: '2026-06-01', department: 'Sales',        category: 'Events',                 vendor: 'Show-Rite Events',     location: 'Mumbai',    businessUnit: 'Sales',      budget: 175000, actualSpend: 168700, status: 'Approved',    priority: 'High',   paymentMethod: 'Project' },
  { recordId: 1061, date: '2026-06-15', department: 'Marketing',    category: 'Digital Advertising',    vendor: 'Google Ads',           location: 'Bengaluru', businessUnit: 'Marketing',  budget: 210000, actualSpend: 198600, status: 'Approved',    priority: 'High',   paymentMethod: 'Monthly' },
  { recordId: 1062, date: '2026-07-01', department: 'Finance',      category: 'Software',               vendor: 'Oracle India',         location: 'Pune',      businessUnit: 'Finance',    budget: 330000, actualSpend: 315800, status: 'Approved',    priority: 'High',   paymentMethod: 'Annual Contract' },
  { recordId: 1063, date: '2026-07-14', department: 'Procurement',  category: 'Office Supplies',        vendor: 'W.W. Grainger',        location: 'Chennai',   businessUnit: 'Corporate',  budget: 48000,  actualSpend: 44200,  status: 'Approved',    priority: 'Low',    paymentMethod: 'Purchase Order' },
  { recordId: 1064, date: '2026-07-28', department: 'Facilities',   category: 'Utilities',              vendor: 'MSEDCL',               location: 'Mumbai',    businessUnit: 'Corporate',  budget: 112000, actualSpend: 118600, status: 'Over Budget', priority: 'Medium', paymentMethod: 'Monthly' },
  { recordId: 1065, date: '2026-08-04', department: 'HR',           category: 'Employee Training',      vendor: 'Dale Carnegie India',  location: 'Delhi NCR', businessUnit: 'People',     budget: 68000,  actualSpend: 61400,  status: 'Approved',    priority: 'Medium', paymentMethod: 'Project' },
  { recordId: 1066, date: '2026-08-18', department: 'IT',           category: 'Software Licenses',      vendor: 'Zoom India',           location: 'Hyderabad', businessUnit: 'Technology', budget: 92000,  actualSpend: 88200,  status: 'Approved',    priority: 'Medium', paymentMethod: 'Annual Contract' },
  { recordId: 1067, date: '2026-09-02', department: 'Operations',   category: 'Logistics',              vendor: 'Ecom Express',         location: 'Bengaluru', businessUnit: 'Operations', budget: 128000, actualSpend: 119600, status: 'Approved',    priority: 'Medium', paymentMethod: 'Purchase Order' },
  { recordId: 1068, date: '2026-09-08', department: 'Sales',        category: 'Travel',                 vendor: 'Corporate Travel Co.', location: 'Mumbai',    businessUnit: 'Sales',      budget: 92000,  actualSpend: 101400, status: 'Over Budget', priority: 'Medium', paymentMethod: 'Corporate Card' },
  { recordId: 1069, date: '2026-09-12', department: 'Marketing',    category: 'Content Services',       vendor: 'FCB Ulka',             location: 'Pune',      businessUnit: 'Marketing',  budget: 145000, actualSpend: 138200, status: 'Approved',    priority: 'High',   paymentMethod: 'Project' },
  { recordId: 1070, date: '2026-09-16', department: 'IT',           category: 'Cloud Infrastructure',   vendor: 'Google Cloud',         location: 'Chennai',   businessUnit: 'Technology', budget: 265000, actualSpend: 249800, status: 'Approved',    priority: 'High',   paymentMethod: 'Monthly' },
];

const seedData = async () => {
  await connectDB();

  try {
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await SpendRecord.deleteMany({});

    // Create test users
    console.log('👤 Creating test users...');
    await User.create({ name: 'Demo User',    email: 'demo@spend.com',     password: 'Demo@123',     role: 'user' });
    await User.create({ name: 'Jane Analyst', email: 'analyst@spend.com',  password: 'Analyst@123',  role: 'analyst' });

    // Insert real Excel records
    console.log(`📊 Seeding ${excelRecords.length} spend records from Excel data...`);
    const records = excelRecords.map(r => ({ ...r, date: new Date(r.date) }));
    await SpendRecord.insertMany(records);

    const totalBudget = records.reduce((s, r) => s + r.budget, 0);
    const totalSpend  = records.reduce((s, r) => s + r.actualSpend, 0);
    const overBudget  = records.filter(r => r.status === 'Over Budget').length;

    console.log('\n✅ Database seeded successfully!');
    console.log(`   📋 Records: ${records.length}`);
    console.log(`   💰 Total Budget: ₹${totalBudget.toLocaleString('en-IN')}`);
    console.log(`   💸 Total Spend:  ₹${totalSpend.toLocaleString('en-IN')}`);
    console.log(`   ⚠️  Over Budget:  ${overBudget} records`);
    console.log('\n🔑 Test Credentials:');
    console.log('   Demo    → demo@spend.com    / Demo@123');
    console.log('   Analyst → analyst@spend.com / Analyst@123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedData();
