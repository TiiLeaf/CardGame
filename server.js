const express = require('express');
const app = express();
const port = 3000;
const server = app.listen(port, () => {
    console.log(`Express server listening on port ${port}.`);
})
const io = require('socket.io')(server);
const getIoInstance = ()=>{
    return io;
}
var rooms = {};
const Game = require('./gameSrc/Game.js');

//serve static files
app.use(express.static('static'));

//404
app.use((req, res) => {
    res.sendFile('./static/404.html', {root: __dirname});
});

//socket events
io.on('connection', (socket) => {
    //CONNENCTION
    console.log(`${socket.id} just connected`);

    //DISCONNECTION
    socket.on("disconnecting", (reason) => {
        console.log(`${socket.id} is disconnecting (${reason})`);
        if (socket.room in rooms) {
            io.to(socket.room).emit('logMessage', `${socket.name} abandoned the game!`);
            rooms[socket.room].sockets.splice(rooms[socket.room].sockets.indexOf(socket.id), 1);
        }
    });

    //ROOM EVENTS
    socket.on("createRoom", (roomCode) => {
        console.log(`${socket.id} is creating a new room: ${roomCode}`);
        rooms[roomCode] = {sockets: [], game: null};
    });

    socket.on("joinRoom", (data) => {
        var roomCode = data.roomCode;
        if (!(roomCode in rooms)) {
            socket.emit('joinFail', 'That room does not exist!');
        } else if (rooms[roomCode].sockets.length >= 2) {
            socket.emit('joinFail', 'That room is full!');
        } else {
            //add the socket to the room
            socket.name = data.name;
            rooms[roomCode].sockets.push(socket.id);
            socket.room = roomCode;
            socket.join(roomCode);
            socket.emit('joinSuccess');
            io.to(roomCode).emit('logMessage', `${socket.name} has joined the game!`);

            console.log(`${socket.id} joined room ${socket.room} as ${socket.name}`);

            if (rooms[roomCode].sockets.length == 2) {
                //if they were the 2nd player to join, start the game
                rooms[roomCode].game = new Game(
                    {name: io.of('/').sockets.get(rooms[roomCode].sockets[0]).name, id: rooms[roomCode].sockets[0]},
                    {name: socket.name, id: socket.id},
                    roomCode,
                    io
                    );
                //send the inital state to the clients
                io.to(roomCode).emit('initialGameState', {
                    "player0Id": rooms[roomCode].game.players[0].socketId,
                    "player0Name": rooms[roomCode].game.players[0].name,
                    "player0Hand": rooms[roomCode].game.players[0].hand.contents,
                    "player0CharacterArt": "mage",
                    "player1Id": rooms[roomCode].game.players[1].socketId,
                    "player1Name": rooms[roomCode].game.players[1].name,
                    "player1Hand": rooms[roomCode].game.players[1].hand.contents,
                    "player1CharacterArt": "necromancer",
                    "shop": rooms[roomCode].game.shop,
                    "shopAmmounts": rooms[roomCode].game.shopAmmounts
                });
                //start the game
                rooms[roomCode].game.startTurn();
            } else { 
                //if they were the first to join, send them the room code
                io.to(roomCode).emit('logMessage', `Invite a friend! Your room code is ${roomCode}.`);
            }
        }
    });

    //CHAT EVENTS
    socket.on('chatMessage', (msg) => {
        io.to(socket.room).emit('chatMessage', `${socket.name}: ${msg}`);
    });

    //GAME EVENTS
    socket.on('playCard', (card, ack) => {
        //verify that the player actually has the card in hand and that they have enough mana
        var game = rooms[socket.room].game;
        if (game.players[game.activePlayer].cardInHand(card) && game.players[game.activePlayer].turn.mana >= card.useCost) {
            game.playCard(card);
            ack(true);
        } else {
            ack(false);
        }
    });

    socket.on('buyCard', (card, ack) => {
        //verify that the shop actually has the card and that the player has enough gold and buys left
        var game = rooms[socket.room].game;
        if (game.shopHasCard(card) && game.players[game.activePlayer].turn.gold >= card.buyCost && game.players[game.activePlayer].turn.buys >= 1) {
            game.buyCard(card);
            ack(true);
        } else {
            ack(false);
        }
    });
});

module.exports = {
    getIoInstance
}