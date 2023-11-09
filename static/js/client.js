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
    multiDrawAnimation(data[`player${playerIndex}Hand`]);
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

socket.on('startSpells', () => {
    turn.phase = 0;
    highlightCards('spell', 'green');
});

socket.on('startResources', () => {
    turn.phase = 1;
    highlightCards('resource', 'green');
});

socket.on('startBuys', () => {
    turn.phase = 2;
    turn.clickAction = 'buy';
    highlightShopCards(turn.gold);
});

socket.on('cleanup', (newHand) => {
    turn.phase = 3;
    turn.clickAction = 'none';
    highlightShopCards(99);
    highlightCards('hand', 'transparent');

    discardTableAnimation();
    discardEntireHandAnimation();
    console.log('newHand', newHand);
    multiDrawAnimation(newHand);
});

socket.on('enemyCleanup', () => {
    discardTableAnimation();
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
    turn.cardsPlayed += 1;
    //show the card the enemy played
    if (!turn.isMyTurn) {
        enemyPlayAnimation(data.card);
    }
    //update turn resources readout
    domHandles.mana.textContent = data.turnDetails.mana;
    turn.mana = data.turnDetails.mana;
    domHandles.gold.textContent = data.turnDetails.gold;
    turn.gold = data.turnDetails.gold;
});


function cardClicked(cardObj, cardElt) {
    //trash is unplayable
    if (cardObj.type == CardTypes.TRASH)
        return;

    //we are trying to buy a card
    if (turn.clickAction == 'buy') {
        tryToBuy(cardObj, ()=>{
            buyAnimation(cardElt);
        });
    }

    //we are trying to play a card
    if (turn.clickAction == 'play' && !animationInProgress) { //TODO: refactor animationInProgress out
        if (cardObj.type == CardTypes.SPELL && turn.phase != 0)
            return;
        if (cardObj.type == CardTypes.RESOURCE && turn.phase != 1)
            return;

        tryToPlay(cardObj, ()=>{
            playAnimation(cardElt);
        });
    }
}