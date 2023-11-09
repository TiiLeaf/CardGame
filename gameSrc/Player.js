const Deck = require('./Deck.js');
const { CardTypes, Copper, EmptyBottle, Spark } = require('./cards.js');

class Player {
    constructor(name, id, isTurn) {
        this.name = name;
        this.socketId = id;
        this.isMyTurn = isTurn;
        this.turn = { mana: 1, gold: 0, buys: 1};
        this.newTurnState = { mana: 1, gold: 0, buys: 1};
        this.hp = 50;
        this.status = {
            "bleed": 0,
            "sick": 0,
            "weak": 0,
        }

        this.discard = new Deck();
        this.hand = new Deck();
        this.deck = new Deck([
            new Spark(),
            new Spark(),
            new Spark(),
            new Copper(),
            new Copper(),
            new Copper(),
            new Copper(),
            new Copper(),
            new Copper(),
            new Copper()
        ]);

        this.deck.shuffle();
        this.hand.contents = this.deck.draw(5);
    }

    //refactor, should be in deck?
    removeFromHand(card) {
        for (var i = 0; i < this.hand.contents.length; i++) {
            var c = this.hand.contents[i];
            if (c.name == card.name && c.id == card.id) {
                this.hand.contents.splice(i, 1);
                return;
            }
        }
    }

    noSpellsInHand() {
        for (var card of this.hand.contents)
            if (card.type == CardTypes.SPELL)
                return false;
        return true;
    }

    noResourcesInHand() {
        for (var card of this.hand.contents)
            if (card.type == CardTypes.RESOURCE)
                return false;
        return true;
    }

    cardInHand(card) {
        for (var c of this.hand.contents)
            if (c.name == card.name && c.id == card.id && c.useCost == card.useCost)
                return true;
        return false;
    }
}

module.exports = Player
