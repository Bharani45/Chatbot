// server.js

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS to allow connections from your frontend
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(express.static(path.join(__dirname, "public")));

// Store connected customers and admins
let customers = {};
let admins = [];

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Identify as customer or admin
  socket.on("register", (role) => {
    socket.role = role;
    if (role === "customer") {
      customers[socket.id] = socket;
    } else if (role === "admin") {
      admins.push(socket);
      // Immediately send the list of all waiting customers to the new admin
      const customerList = Object.keys(customers).map(id => ({
        id: id,
        message: 'No message yet'
      }));
      socket.emit("customerList", customerList);
    }
  });

  // Customer sends a message
  socket.on("customerMessage", (msg) => {
    if (socket.role === "customer") {
      // Send message to all admins
      admins.forEach((adminSocket) => {
        adminSocket.emit("newCustomerMessage", { id: socket.id, message: msg });
      });
    }
  });

  // Admin replies to customer
  socket.on("adminReply", ({ customerId, message }) => {
    const customerSocket = customers[customerId];
    if (customerSocket) {
      customerSocket.emit("botReply", message);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    if (socket.role === "customer") {
      delete customers[socket.id];
    } else if (socket.role === "admin") {
      admins = admins.filter(admin => admin.id !== socket.id);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));