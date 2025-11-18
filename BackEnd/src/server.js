const http = require('http'); // /// ADDED
const { Server } = require('socket.io'); // /// ADDED
const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app); // /// ADDED
const io = new Server(server, { // /// ADDED
  cors: { // /// ADDED
    origin: '*', // /// ADDED
    methods: ['GET', 'POST', 'PATCH'], // /// ADDED
  }, // /// ADDED
}); // /// ADDED

app.set('io', io); // /// ADDED

io.on('connection', (socket) => { // /// ADDED
  console.log(`🔌 Socket connected: ${socket.id}`); // /// ADDED
  socket.on('disconnect', () => { // /// ADDED
    console.log(`🔌 Socket disconnected: ${socket.id}`); // /// ADDED
  }); // /// ADDED
}); // /// ADDED

server.listen(PORT, () => {
  console.log(`🚀 RapidAid Backend running on port ${PORT}`);
});

