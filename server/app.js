const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const taskStatusRoutes = require('./routes/taskStatus');
const executionRoutes = require('./routes/execution');
const webhookRoutes = require('./routes/webhooks');

const app = express();

const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : 'http://localhost:5173';
app.use(cors({ origin: [clientUrl, 'http://localhost:5173'], credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects', taskRoutes);
app.use('/api/projects', taskStatusRoutes);
app.use('/api/projects', executionRoutes);
app.use('/api/projects', webhookRoutes);

app.use(errorHandler);

module.exports = app;
