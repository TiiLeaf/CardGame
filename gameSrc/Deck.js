class Deck {
    constructor(cards) {
        if (cards)
            this.contents = cards;
        else
            this.contents = [];
    }

    draw(count) {
        var result = [];
        for (var i = 0; i < count; i++) {
            result.push(this.contents.shift());
            if (this.contents.length <= 0) {
                this.replenishFromDiscard();
            }
        }
        return result;
    }

    replenishFromDiscard(discard) {
        this.contents = [...discard];
        this.shuffle();
    }

    shuffle() {
        for (var i = this.contents.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = this.contents[i];
            this.contents[i] = this.contents[j];
            this.contents[j] = temp;
        }
    }
}

module.exports = Deck
