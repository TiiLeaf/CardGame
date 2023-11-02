function bindChatEvent() {
    document.getElementById('chatForm').addEventListener('submit', (e) => {
        e.preventDefault();
        var chatInput = document.getElementById('chatInput');
        if (chatInput.value) {
            socket.emit('chatMessage', chatInput.value);
            chatInput.value = '';
        }
    });
}

socket.on('chatMessage', (msg) => {
    var messageContainer = document.getElementById('chat');
    var newMessage = document.createElement('p');
    newMessage.textContent = msg;
    messageContainer.appendChild(newMessage);
    messageContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
});

socket.on('logMessage', (msg) => {
    var messageContainer = document.getElementById('log');
    var newMessage = document.createElement('p');
    newMessage.innerHTML = msg;
    messageContainer.appendChild(newMessage);
    messageContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
});