const socket = io(`localhost:3000`);
var playerIndex = -1;
var enemyIndex = -1;
var turn = {}
const newTurnState = {
    mana: 1,
    gold: 0,
    isMyTurn: true,
    phase: 0,
    cardsPlayed: 0,
    clickAction: 'play',
    buys: 1
}


socket.on('initialGameState', (data) => {
    console.log("initialGameState", data);
    if (socket.id == data.player0Id) {
        playerIndex = 0;
        enemyIndex = 1;
    } else {
        playerIndex = 1;
        enemyIndex = 0;
    }

    domHandles.playerName.textContent = data[`player${playerIndex}Name`];
    domHandles.enemyName.textContent = data[`player${enemyIndex}Name`];
    domHandles.playerPortrait.style.backgroundImage = `url(../res/img/characters/${data[`player${playerIndex}CharacterArt`]}.png)`;
    domHandles.enemyPortrait.style.backgroundImage = `url(../res/img/characters/${data[`player${enemyIndex}CharacterArt`]}.png)`;

    //build spell shop
    for (var i = 0; i < 10; i++) {
        addShopCard(data.shop[0][i]);
    }
    //build resource shop
    for (var i = 0; i < 6; i++) {
        addShopCard(data.shop[1][i], true);
    }

    //make the players decks look full
    domHandles.playerDeckVisualizer.style.display = "block";
    domHandles.playerDeckCount.textContent = "10";
    domHandles.enemyDeckVisualizer.style.display = "block";
    domHandles.enemyDeckCount.textContent = "5";

    //give the enemy 5 cardbacks
    for (var i = 0; i < 5; i++)
        domHandles.enemyHand.appendChild(createCardBack());

    //draw my cards
    multiDraw(data[`player${playerIndex}Hand`]);
});

socket.on('prompt', (msg) => {
    domHandles.prompt.textContent = msg;
});

socket.on('startTurn', (playingIndex) => {
    turn = {...newTurnState};
    if (playerIndex != playingIndex)
        turn.isMyTurn = false;

    //reset turn readout
    domHandles.mana.textContent = turn.mana;
    domHandles.gold.textContent = turn.gold;
});

socket.on('startActions', () => {
    turn.phase = 0;
    highlightCards('spell', 'green');
});

socket.on('startBuys', () => {
    turn.phase = 1;
    highlightCards('resource', 'green');
});

function tryToPlay(card, callback) {
    socket.emit('playCard', card, (success) => {
        if (success)
            callback();
    });
}

function tryToBuy(card, callback) {
    socket.emit('buyCard', card, (success) => {
        if (success)
            callback();
    });
}

socket.on('cardPlayed', (data) => {
    console.log(data);

    turn.cardsPlayed += 1;
    //show the card the enemy played
    if (!turn.isMyTurn) {
        var cardElt = createCard(data.card);
        cardElt.style.zIndex = 1;
        cardElt.style.position = 'fixed';
        var coords = domHandles.table.getBoundingClientRect();
        cardElt.style.top = `${(turn.cardsPlayed % 4) * 22 + coords.top}px`;
        cardElt.style.left = `${((turn.cardsPlayed * 40)%(coords.width-200)) + coords.left}px`;
        cardElt.style.transformOrigin = "top left";
        cardElt.style.transform = "scale(0.65)";
        domHandles.table.appendChild(cardElt);
    }
    //update turn resources readout
    domHandles.mana.textContent = data.turnDetails.mana;
    domHandles.gold.textContent = data.turnDetails.gold;
});