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

        this.activePlayer = -1;
        this.turnCount = 0;
        this.turnPhase = 0;
        this.turnCardsBought = [];
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
        this.activePlayer = Math.random() > 0.5 ? 0 : 1;
        this.players[0] = new Player(playerOneDetails.name, playerOneDetails.id, this.activePlayer == 0);
        this.players[1] = new Player(playerTwoDetails.name, playerTwoDetails.id, this.activePlayer == 1);

        this.emit('logMessage', `The game is starting... <br> Starting decks are dealt. <br> ${this.players[0].name} draws 5 cards. <br> ${this.players[1].name} draws 5 cards.`);
    }

    generateShop() {
        this.shop = [[], []];
        for (var i = 0; i < 10; i++) {
            this.shop[0].push(cardPool.spells[Math.floor(Math.random() * cardPool.spells.length)]);
        }
        this.shop[0].sort((a, b) => {
            return b.buyCost - a.buyCost;
        });
        for (var i = 0; i < 6; i++) {
            this.shop[1].push(cardPool.potions[Math.floor(Math.random() * cardPool.potions.length)]);
        }
        this.shop[1].sort((a, b) => {
            return b.buyCost - a.buyCost;
        });
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
        this.turnCount += 1;
        var player = this.players[this.activePlayer];
        //reset stuff
        player.turn = {...player.newTurnState};

        //events for new turn
        this.emit('logMessage', `<strong>Turn ${this.turnCount} - ${player.name}</strong>`);
        this.emitToPlayer(!this.activePlayer, 'prompt', `Wait for ${player.name}...`);
        this.emit('startTurn', this.activePlayer);

        //we start with the spell phase if there are any action cards in hand
        if (!player.noSpellsInHand()) {
            this.turnPhase = 0;
            this.emitToPlayer(this.activePlayer, 'startSpells');
            this.emitToPlayer(this.activePlayer, 'prompt', `Play spell cards.`);
        } else if (!player.noResourcesInHand()) { //otherwise start with resources if we can
            this.turnPhase = 1;
            this.emitToPlayer(this.activePlayer, 'startResources');
            this.emitToPlayer(this.activePlayer, 'prompt', `Play resource cards.`);
        } else { //otherwise start buy phase
            this.turnPhase = 2;
            this.emitToPlayer(this.activePlayer, 'startBuys');
            this.emitToPlayer(this.activePlayer, 'prompt', `Buy a card.`);         
        }

    }

    buyCard(card) {
        //buy phase: did that card make the player run out of buys?
        var player = this.players[this.activePlayer];
        player.turn.buys -= 1;
        this.emit('logMessage', `${player.name} buys a ${card.name}.`);
        this.turnCardsBought.push(card);
        if (this.turnPhase == 2 && player.turn.buys == 0) {
            this.endTurn();
        }
    }

    playCard(card) {
        var player = this.players[this.activePlayer];
        cardPool['all'][card.id].played(player, this.players[Number(!this.activePlayer)]);

        //move the card out of the players hand
        this.tableCards.push(card);
        player.removeFromHand(card);

        //emit event
        this.emit('cardPlayed', { card: card, players: this.players, turnDetails: this.players[this.activePlayer].turn });
        this.emit('logMessage', `${player.name} plays ${card.name}.`);

        console.log(player.name + " played " + card.name);
        console.log(player.turn);

        //spell phase: did that card make the player run out of mana?
        if (this.turnPhase == 0 && player.turn.mana == 0) {
            this.turnPhase = 1;
            this.emitToPlayer(this.activePlayer, 'startResources');
            this.emitToPlayer(this.activePlayer, 'prompt', `Play resource cards.`);
        }

        //resource phase: did that card make the player run out of resource cards?
        if (this.turnPhase == 1 && player.noResourcesInHand()) {
            this.turnPhase = 2;
            this.emitToPlayer(this.activePlayer, 'startBuys');
            this.emitToPlayer(this.activePlayer, 'prompt', `Buy a card.`);
        }
    }

    endTurn() {
        var endingPlayer = this.players[this.activePlayer];
        this.emit('logMessage', `${endingPlayer.name} cleans up, they draw 5 cards.`);

        //cleanup
        endingPlayer.discard.add(endingPlayer.hand.contents);
        endingPlayer.discard.add(this.tableCards);
        endingPlayer.discard.add(this.turnCardsBought);
        var newHand = endingPlayer.deck.draw(5);
        console.log(newHand);
        endingPlayer.hand.contents = newHand;
        this.tableCards = [];
        this.turnCardsBought = [];
        this.emitToPlayer(this.activePlayer, 'cleanup', newHand);
        this.activePlayer = Number(!this.activePlayer);
        this.emitToPlayer(this.activePlayer, 'enemyCleanup');

        //start next turn
        this.startTurn();
    }
}

module.exports = Game