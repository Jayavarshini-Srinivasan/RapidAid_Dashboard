const http = require('http'); // /// ADDED
let Server; // /// ADDED
try { // /// ADDED
  ({ Server } = require('socket.io')); // /// ADDED
} catch (_) { // /// ADDED
  Server = null; // /// ADDED
} // /// ADDED
const app = require('./app');
require('dotenv').config();

let PORT = Number(process.env.PORT || 5000); // /// ADDED

const server = http.createServer(app); // /// ADDED
if (Server) { // /// ADDED
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
} // /// ADDED

server.on('error', (err) => { // /// ADDED
  if (err && err.code === 'EADDRINUSE') { // /// ADDED
    PORT = PORT + 1; // /// ADDED
    server.listen(PORT, () => { // /// ADDED
      console.log(`🚀 RapidAid Backend recovered on port ${PORT}`); // /// ADDED
    }); // /// ADDED
  } else { // /// ADDED
    console.error(err); // /// ADDED
  } // /// ADDED
}); // /// ADDED

server.listen(PORT, () => { // /// ADDED
  console.log(`🚀 RapidAid Backend running on port ${PORT}`); // /// ADDED
}); // /// ADDED

