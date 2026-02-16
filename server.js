const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, './.env') })
const app=require("./server/app");
const connectDB=require("./server/config/db");
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;

connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined conversation: ${conversationId}`);
  });

  socket.on('send_message', (data) => {
    // data: { conversationId, content, sender, ... }
    // Ensure we emit to the conversation room
    const roomId = data.conversation || data.order; // Support both or just conversation
    if (roomId) {
        io.to(roomId).emit('receive_message', data);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT,()=>{
  console.log(`Server is running  on port ${PORT}`);
});
process.on("unhandledRejection",(err,promise)=>{
  console.error(`Error: ${err.message}`);
  server.close(()=>{process.exit(1)});
})

