import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Project from './models/Project.js';
import Task from './models/Task.js';
import Expense from './models/Expense.js';
import Fund from './models/Fund.js';
import Announcement from './models/Announcement.js';
import Document from './models/Document.js';
import Message from './models/Message.js';
import LeaveRequest from './models/LeaveRequest.js';
import Event from './models/Event.js';

import { USERS, PROJECTS, TASKS, EXPENSES, FUNDS } from '../src/data/mockData.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ngo-vms');
    console.log('✅ Connected to MongoDB');

    console.log('Inserting new sample data without clearing existing data...');

    // Insert users first and build a map of old ID -> new _id
    const insertedUsers = await User.insertMany(USERS);
    const idMap = {};
    USERS.forEach((user, index) => {
      idMap[user.id] = insertedUsers[index]._id.toString();
    });

    // Remap Projects
    const remappedProjects = PROJECTS.map(p => ({
      ...p,
      assignedStaff: p.assignedStaff.map(staffId => idMap[staffId] || staffId)
    }));
    const insertedProjects = await Project.insertMany(remappedProjects);

    // Build project map as well
    PROJECTS.forEach((proj, index) => {
      idMap[proj.id] = insertedProjects[index]._id.toString();
    });

    // Remap Tasks
    const remappedTasks = TASKS.map(t => ({
      ...t,
      projectId: idMap[t.projectId] || t.projectId,
      // The UI may use names or IDs for assignedTo, map if it matches a mock ID
      assignedTo: idMap[t.assignedTo] || t.assignedTo
    }));
    await Task.insertMany(remappedTasks);

    // Remap Expenses
    const remappedExpenses = EXPENSES.map(e => ({
      ...e,
      projectId: idMap[e.projectId] || e.projectId,
      addedBy: idMap[e.addedBy] || e.addedBy
    }));
    await Expense.insertMany(remappedExpenses);

    const fund = new Fund(FUNDS);
    await fund.save();

    // Add Events / Campaigns
    const adminId = 'u1';
    const staffId = 'u2';
    const volunteerId = 'u3';

    await Event.insertMany([
      { title: 'Annual Community Fundraiser', description: 'Join us to raise funds for the new water well project in the local district.', date: new Date('2026-08-15'), location: 'City Central Park', type: 'Fundraiser', registrants: [] },
      { title: 'Volunteer Orientation & Training', description: 'Mandatory session for all new volunteers joining this quarter.', date: new Date('2026-05-10'), location: 'Main Branch Office', type: 'Workshop', registrants: [volunteerId] },
      { title: 'Winter Clothes Drive', description: 'Campaign to collect warm clothes for the upcoming winter season.', date: new Date('2026-10-01'), location: 'Multiple Depots', type: 'Drive', registrants: [staffId, volunteerId] }
    ]);

    // Add Announcements
    await Announcement.insertMany([
      { title: 'Welcome to the New NGO VMS!', content: 'We are excited to launch the new volunteer management system.', author: 'Admin User', priority: 'High' },
      { title: 'Upcoming Food Drive', content: 'Please register for the food drive coming up this weekend.', author: 'Sarah Staff', priority: 'Normal' }
    ]);

    // Add Documents
    await Document.insertMany([
      { title: 'Volunteer Code of Conduct', fileUrl: 'https://example.com/code-of-conduct.pdf', category: 'Policy', uploadedBy: 'Admin User' },
      { title: 'First Aid Training Guide', fileUrl: 'https://example.com/first-aid.pdf', category: 'Training', uploadedBy: 'Sarah Staff' }
    ]);

    // Add Messages

    await Message.insertMany([
      { senderId: adminId, receiverId: staffId, content: 'Can you organize the volunteers for project A?', read: true },
      { senderId: staffId, receiverId: adminId, content: 'Yes, I have assigned the initial tasks.', read: false },
      { senderId: staffId, receiverId: volunteerId, content: 'Welcome Mike! Please check your assigned tasks.', read: false }
    ]);

    // Add Leave Requests
    await LeaveRequest.insertMany([
      { userId: volunteerId, userName: insertedUsers[2].name, startDate: new Date('2026-06-10'), endDate: new Date('2026-06-15'), reason: 'Family vacation', status: 'Pending' },
      { userId: staffId, userName: insertedUsers[1].name, startDate: new Date('2026-05-01'), endDate: new Date('2026-05-02'), reason: 'Feeling unwell', status: 'Approved' }
    ]);

    console.log('🌱 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
