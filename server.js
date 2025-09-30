const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

// Store connected customers
let customers = {};

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Identify as customer or admin
  socket.on("register", (role) => {
    socket.role = role;
    if (role === "customer") {
      customers[socket.id] = socket;
    }
  });

  // Customer sends a message
  socket.on("customerMessage", (msg) => {
    if (socket.role === "customer") {
      // Send message to all admins
      io.sockets.sockets.forEach((s) => {
        if (s.role === "admin") {
          s.emit("newCustomerMessage", { id: socket.id, message: msg });
        }
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
    if (socket.role === "customer") delete customers[socket.id];
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
