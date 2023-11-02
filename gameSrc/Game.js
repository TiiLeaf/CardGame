const {
    Copper, Silver, Gold,
    EmptyBottle, CleansingTincture, ExplosiveAmul, SickeningTonic,
    Foresight, Spark, Blight
} = require('./cards.js');
var cardPool = {
    "resources": [new Copper, new Silver, new Gold],
    "potions": [new CleansingTincture, new ExplosiveAmul, new SickeningTonic],
    "spells": [new Foresight, new Spark, new Blight],
    "trash": [new EmptyBottle],
    "all": []
};
cardPool['all'].push(...cardPool.resources);
cardPool['all'].push(...cardPool.potions);
cardPool['all'].push(...cardPool.spells);
cardPool['all'].push(...cardPool.trash);
const Player = require('./Player.js');

class Game {
    constructor(playerOneDetails, playerTwoDetails, roomCode, io) {
        this.io = io;
        this.roomCode = roomCode;

        this.players = [];
        this.shop = [[], []];
        this.shopAmmounts = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];

        this.turn = -1;
        this.turnPhase = 0;
        this.tableCards = [];

        this.init(playerOneDetails, playerTwoDetails);
    }

    emit(event, data) {
        this.io.to(this.roomCode).emit(event, data);
    }

    emitToPlayer(playerIndex, event, data) {
        this.io.to(this.players[Number(playerIndex)].socketId).emit(event, data);
    }

    init(playerOneDetails, playerTwoDetails) {
        this.generateShop();
        this.turn = Math.random() > 0.5 ? 0 : 1;
        this.players[0] = new Player(playerOneDetails.name, playerOneDetails.id, this.turn == 0);
        this.players[1] = new Player(playerTwoDetails.name, playerTwoDetails.id, this.turn == 1);

        this.emit('logMessage', `The game is starting... <br> Starting decks are dealt. <br> ${this.players[0].name} draws 5 cards. <br> ${this.players[1].name} draws 5 cards.`);
    }

    generateShop() {
        this.shop = [[], []];
        for (var i = 0; i < 10; i++) {
            this.shop[0].push(cardPool.spells[Math.floor(Math.random() * cardPool.spells.length)]);
        }
        for (var i = 0; i < 6; i++) {
            this.shop[1].push(cardPool.potions[Math.floor(Math.random() * cardPool.potions.length)]);
        }
        this.shop[1][0] = new Copper;
        this.shop[1][2] = new Silver;
        this.shop[1][4] = new Gold;
    }

    shopHasCard(card) {
        for (var shop of this.shop)
            for (var c of shop)
                if (c.name == card.name && c.id == card.id && c.useCost == card.useCost && c.buyCost == card.buyCost)
                    return true;
        return false;
    }

    startTurn() {
        var player = this.players[this.turn];
        //reset stuff
        player.turn = player.newTurnState;
        this.tableCards = [];

        //events for new turn
        this.emit('logMessage', `<strong>Turn 1 - ${player.name}</strong>`);
        this.emitToPlayer(!this.turn, 'prompt', `Wait for ${player.name}...`);
        this.emit('startTurn', this.turn);

        //we start with the spell phase if there are any action cards in hand
        if (!player.noSpellsInHand()) {
            this.turnPhase = 0;
            this.emitToPlayer(this.turn, 'startActions');
            this.emitToPlayer(this.turn, 'prompt', `Play spell cards.`);
        } else {
            this.turnPhase = 1;
            this.emitToPlayer(this.turn, 'startBuys');
            this.emitToPlayer(this.turn, 'prompt', `Play coins, buy a card.`);
        }

    }

    buyCard(card) {
    }

    playCard(card) {
        var player = this.players[this.turn];
        cardPool['all'][card.id].played(player, this.players[Number(!this.turn)]);

        //move the card out of the players hand
        this.tableCards.push(card);
        player.removeFromHand(card);

        //emit event
        this.emit('cardPlayed', { card: card, players: this.players, turnDetails: this.players[this.turn].turn });
        this.emit('logMessage', `${player.name} plays ${card.name}.`);

        console.log(player.name + " played " + card.name);
        console.log(player.turn);
        console.log(player.hand.contents);

        //spell phase: did that card make the player run out of mana?
        if (this.turnPhase == 0 && player.turn.mana == 0) {
            this.turnPhase = 1;
            this.emitToPlayer(this.turn, 'startBuys');
            this.emitToPlayer(this.turn, 'prompt', `Play coins, buy a card.`);
        }

    }

    endTurn() {
        this.turn = Number(!this.turn);
    }
}

module.exports = Game