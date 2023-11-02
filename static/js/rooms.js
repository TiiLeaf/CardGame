const urlRoom = getQueryParameter("room");
const urlName = getQueryParameter("name");

function showRoomBrowser() {
    document.getElementById('mainRoot').style.display = "none";
    document.getElementById('roomBrowserRoot').style.display = "block";
    if (urlRoom) {
        document.getElementById('nicknameInput').value = urlName;
        joinRoom(urlRoom);
    }
}

function createRoom() {
    const roomCode = generateRoomCode();
    socket.emit('createRoom', roomCode);
    joinRoom(roomCode);
}

function joinRoom(roomCode) {
    if (!roomCode || roomCode.length <= 0)
        roomCode = document.getElementById('roomCodeInput').value;
    
    var data = {name: document.getElementById('nicknameInput').value || "Anonymous", roomCode: roomCode};
    updateQueryParameter('room', roomCode);
    socket.emit('joinRoom', data);
}

socket.on('joinFail', (error) => {
    const errorElt = document.getElementById('joinRoomError');
    errorElt.classList.remove('hidden');
    errorElt.classList.add('visible');
    errorElt.innerHTML = error;
    updateQueryParameter('room', '');
    setTimeout(() => {
        errorElt.classList.add('hidden');
    }, 1);
});

socket.on('joinSuccess', () => {
    document.getElementById('roomBrowserRoot').style.display = "none";
    document.getElementById('mainRoot').style.display = "flex";
});