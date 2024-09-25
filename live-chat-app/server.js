const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const Message = require("./models/Message");
const app = express();
const server = http.createServer(app);
require('dotenv').config(); 

const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors());

const mongoURI =process.env.URL;
 
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

let onlineUsers = [];

io.on("connection", async (socket) => {
  console.log("A user connected");

  try {
    const messages = await Message.find().sort({ _id: 1 });
    socket.emit("chatHistory", messages);
  } catch (err) {
    console.error("Error fetching chat history:", err);
  }

  socket.on("joinChat", (username) => {
    const user = { id: socket.id, username };
    onlineUsers.push(user);
    io.emit("onlineUsers", onlineUsers);
    console.log(`${username} has joined the chat`);
  });

  socket.on("chatMessage", async ({ message, author }) => {
    const timestamp = new Date().toLocaleTimeString();

    const newMessage = new Message({ message, author, timestamp });
    try {
      await newMessage.save();
      io.emit("chatMessage", { message, author, timestamp });
    } catch (err) {
      console.error("Error saving message to MongoDB:", err);
    }
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.id !== socket.id);
    io.emit("onlineUsers", onlineUsers);
    console.log("A user disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
