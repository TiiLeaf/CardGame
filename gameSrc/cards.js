class Card {
    constructor(id, name, type, buyCost, description) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.buyCost = buyCost;
        this.description = description;
        this.useCost = 0;
        if (type == CardTypes.SPELL)
            this.useCost = 1;
    }

    played(player, enemy) {
        player.turn.mana -= this.useCost;
    }
}

const CardTypes = {
    SPELL: 0,
    RESOURCE: 1,
    POTION: 2,
    TRASH: 3
}

class Copper extends Card {
    constructor() {
        super(0, "Copper Coin", CardTypes.RESOURCE, 0, "+1 [gold]");
    }

    played(player, enemy) {
        super.played(player, enemy);
        player.turn.gold += 1;
    }
}

class Silver extends Card {
    constructor() {
        super(1, "Silver Coin", CardTypes.RESOURCE, 3, "+2 [gold]");
    }

    played(player, enemy) {
        super.played(player, enemy);
        player.turn.gold += 2;
    }
}

class Gold extends Card {
    constructor() {
        super(2, "Gold Coin", CardTypes.RESOURCE, 6, "+3 [gold]");
    }

    played(player, enemy) {
        super.played(player, enemy);
        player.turn.gold += 3;
    }
}

class CleansingTincture extends Card {
    constructor() {
        super(3, "Cleansing Tincture", CardTypes.POTION, 4, "(Instantly) Cure your status effect with the highest stack. Gain one Empty Bottle.");
    }

    played(player, enemy) {
        super.played(player, enemy);
        var statuses = ["bleed", "sick", "weak"];
        var highestStack = 0;
        var stackIndex = -1;
        for (var i = 0; i < statuses.length; i++) {
            if (player.status[statuses[i]] > highestStack) {
                highestStack = player.status[statuses[i]];
                stackIndex = i;
            }
        }
        player.status[statuses[stackIndex]] = 0;
    }
}

class ExplosiveAmul extends Card {
    constructor() {
        super(4, "Explosive Ampul", CardTypes.POTION, 7, "(Instantly) Deal 9 damage. Gain one Empty Bottle.");
    }

    played(player, enemy) {
        super.played(player, enemy);
        enemy.hp -= 9;
    }
}

class SickeningTonic extends Card {
    constructor() {
        super(5, "Sickening Tonic", CardTypes.POTION, 2, "(Instantly) Inflict 1 sick. Gain one Empty Bottle.");
    }

    played(player, enemy) {
        super.played(player, enemy);
        enemy.status["sick"] += 1;
    }
}

class Foresight extends Card {
    constructor() {
        super(6, "Foresight", CardTypes.SPELL, 4, "+1 Card <br> +1 [mana]");
    }

    played(player, enemy) {
        super.played(player, enemy);
        player.turn.mana += 1;
        //player.draw(1);
    }
}

class Spark extends Card {
    constructor() {
        super(7, "Spark", CardTypes.SPELL, 2, "Deal 1 damage.");
    }

    played(player, enemy) {
        super.played(player, enemy);
        enemy.hp -= 1;
    }
}

class Blight extends Card {
    constructor() {
        super(8, "Blight", CardTypes.SPELL, 2, "Inflict 1 [sick]. You may discard this to double your enemy's sick stack.");
    }

    played(player, enemy) {
        super.played(player, enemy);
        player.hp += 1;
    }
}

class EmptyBottle extends Card {
    constructor() {
        super(9, "Empty Bottle", CardTypes.TRASH, 0, "Cannot be played.");
    }

    played(player, enemy) {
        super.played(player, enemy);
    }
}

module.exports = {
    CardTypes,
    Copper, Silver, Gold,
    CleansingTincture, ExplosiveAmul, SickeningTonic,
    Foresight, Spark, Blight,  
    EmptyBottle
}
