const socket = io();
socket.emit("register", "customer");

const messagesDiv = document.getElementById("messages");
const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");

function appendMessage(sender, text) {
  const p = document.createElement("p");
  p.className = sender === "You" ? "user" : "bot";
  p.textContent = `${sender}: ${text}`;
  messagesDiv.appendChild(p);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function sendMessage() {
  const msg = input.value.trim();
  if (!msg) return;
  appendMessage("You", msg);
  socket.emit("customerMessage", msg);
  input.value = "";
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", (e) => { if (e.key === "Enter") sendMessage(); });

socket.on("botReply", (msg) => appendMessage("Admin", msg));
