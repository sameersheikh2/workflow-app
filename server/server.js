require('dotenv').config();

const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const { setupSocket } = require('./socket');

const server = http.createServer(app);
const io = setupSocket(server);

app.set('io', io);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
