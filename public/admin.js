const socket = io();
socket.emit("register", "admin");

const customersDiv = document.getElementById("customers");

// Track customer messages
const customerData = {};

socket.on("newCustomerMessage", ({ id, message }) => {
  if (!customerData[id]) {
    // Create customer panel
    const div = document.createElement("div");
    div.className = "customer";
    div.id = `customer-${id}`;
    div.innerHTML = `<h4>Customer ${id}</h4>
                     <div class="messages" id="messages-${id}"></div>
                     <input placeholder="Reply..." id="input-${id}" />
                     <button id="send-${id}">Send</button>`;
    customersDiv.appendChild(div);

    const sendBtn = document.getElementById(`send-${id}`);
    const inputField = document.getElementById(`input-${id}`);

    sendBtn.addEventListener("click", () => {
      const msg = inputField.value.trim();
      if (!msg) return;
      socket.emit("adminReply", { customerId: id, message: msg });
      appendMessage(id, "Admin", msg);
      inputField.value = "";
    });

    inputField.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendBtn.click();
    });

    customerData[id] = true;
  }

  appendMessage(id, "Customer", message);
});

function appendMessage(customerId, sender, message) {
  const messagesDiv = document.getElementById(`messages-${customerId}`);
  if (!messagesDiv) return;
  const p = document.createElement("p");
  p.textContent = `${sender}: ${message}`;
  messagesDiv.appendChild(p);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
