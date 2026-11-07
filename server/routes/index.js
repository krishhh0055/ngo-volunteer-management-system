import express from 'express';
import { getHealthStatus } from '../controllers/healthController.js';
import { getProjects, createProject, updateProject, deleteProject } from '../controllers/projectController.js';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { getExpenses, createExpense, deleteExpense } from '../controllers/expenseController.js';
import { getNotifications, createNotification, updateNotification } from '../controllers/notificationController.js';
import { getFunds, addDonation } from '../controllers/fundController.js';
import { getMessages, sendMessage, markAsRead } from '../controllers/messageController.js';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../controllers/announcementController.js';
import { getEvents, createEvent, registerForEvent, deleteEvent } from '../controllers/eventController.js';
import { getLeaveRequests, createLeaveRequest, updateLeaveStatus, deleteLeaveRequest } from '../controllers/leaveRequestController.js';
import { getSalaries, createSalary, updateSalary, deleteSalary } from '../controllers/salaryController.js';
import uploadRouter from './upload.js';

const router = express.Router();

// Health Check Route
router.get('/health', getHealthStatus);

// Projects
router.route('/projects').get(getProjects).post(createProject);
router.put('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);

// Users
router.route('/users').get(getUsers).post(createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Tasks
router.route('/tasks').get(getTasks).post(createTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

// Expenses
router.route('/expenses').get(getExpenses).post(createExpense);
router.delete('/expenses/:id', deleteExpense);

// Notifications
router.route('/notifications').get(getNotifications).post(createNotification);
router.put('/notifications/:id', updateNotification);

// Funds
router.get('/funds', getFunds);
router.post('/funds/donations', addDonation);

// Messages
router.get('/messages/:userId', getMessages);
router.post('/messages', sendMessage);
router.put('/messages/:id/read', markAsRead);

// Announcements
router.route('/announcements').get(getAnnouncements).post(createAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

// Events
router.route('/events').get(getEvents).post(createEvent);
router.delete('/events/:id', deleteEvent);
router.post('/events/:id/register', registerForEvent);



// Leave Requests
router.route('/leave-requests').get(getLeaveRequests).post(createLeaveRequest);
router.put('/leave-requests/:id', updateLeaveStatus);
router.delete('/leave-requests/:id', deleteLeaveRequest);

// Salaries
router.route('/salaries').get(getSalaries).post(createSalary);
router.put('/salaries/:id', updateSalary);
router.delete('/salaries/:id', deleteSalary);

// Uploads
router.use('/upload', uploadRouter);

export default router;
