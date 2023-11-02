const CardTypes = {
    SPELL: 0,
    RESOURCE: 1,
    POTION: 2,
    TRASH: 3
}
const CardTypeNames = ["Spell", "Resource", "Potion", "Trash"];

function updateQueryParameter(name, value, url = window.location.href) {
    var newUrl = new URL(url);
    newUrl.searchParams.set(name, value);
    history.pushState({}, "", newUrl);
}

function getQueryParameter(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function generateRoomCode(length = 5) {
    const letters = [];
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < length; i++) {
        letters[i] = alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return letters.join('');
};

var domHandles = {};
function getDomHandles() {
    domHandles.playerName = document.getElementsByClassName('playerName')[1];
    domHandles.playerHp = document.getElementsByClassName('hp')[1];
    domHandles.playerPortrait = document.getElementsByClassName('portrait')[1];
    domHandles.playerBleed = document.getElementsByClassName('bleed')[1];
    domHandles.playerSick = document.getElementsByClassName('sick')[1];
    domHandles.playerWeak = document.getElementsByClassName('weak')[1];
    domHandles.playerDeckCount = document.getElementsByClassName('pileCount')[2];
    domHandles.playerDeckVisualizer = document.getElementsByClassName('pileVisualizer')[1];
    domHandles.playerHand = document.getElementsByClassName('hand')[1];


    domHandles.enemyName = document.getElementsByClassName('playerName')[0];
    domHandles.enemyHp = document.getElementsByClassName('hp')[0];
    domHandles.enemyPortrait = document.getElementsByClassName('portrait')[0];
    domHandles.enemyBleed = document.getElementsByClassName('bleed')[0];
    domHandles.enemySick = document.getElementsByClassName('sick')[0];
    domHandles.enemyWeak = document.getElementsByClassName('weak')[0];
    domHandles.enemyDeckCount = document.getElementsByClassName('pileCount')[0];
    domHandles.enemyDeckVisualizer = document.getElementsByClassName('pileVisualizer')[0];
    domHandles.enemyHand = document.getElementsByClassName('hand')[0];

    domHandles.spellShop = document.getElementById("spellShop");
    domHandles.resourceShop = document.getElementById("resourceShop");
    domHandles.table = document.getElementById("tableCards");
    domHandles.prompt = document.getElementById("prompt");
    domHandles.mana = document.getElementById("mana");
    domHandles.gold = document.getElementById("gold");
}

function addShopCard(cardObj, resourceCard = false) {
    var mainClass = 'shopCard';
    var destinationElt = domHandles.spellShop;
    if (resourceCard) {
        mainClass = 'resourceShopCard';
        destinationElt = domHandles.resourceShop;
    }

    var cardElt = document.createElement('div');
    cardElt.classList.add(mainClass);
    var content = document.createElement('div');
    content.classList.add('shopCardContent');
    var cost = document.createElement('span');
    cost.classList.add('cost');
    var name = document.createElement('span');
    name.classList.add('name');
    var type = document.createElement('span');
    type.classList.add('type');
    var count = document.createElement('span');
    count.classList.add('count');
    var cardArt = document.createElement('div');
    cardArt.classList.add('cardArt');

    cost.textContent = cardObj.buyCost;
    name.textContent = cardObj.name;
    type.textContent = CardTypeNames[cardObj.type];
    count.textContent = 10;
    //cardArt.style.backgroundImage = `url(../res/img/cards/${cardObj.name.toLowerCase()}.png)`;
    content.appendChild(cost);
    content.appendChild(name);
    content.appendChild(type);
    content.appendChild(count);
    cardElt.appendChild(cardArt);
    cardElt.appendChild(content);
    destinationElt.appendChild(cardElt);
}

function createCard(cardObj) {
    var typeText = CardTypeNames[cardObj.type];
    
    var cardElt = document.createElement('div');
    cardElt.classList.add('card');
    var contentContainer = document.createElement('div');
    contentContainer.classList.add('cardContent');
    var cost = document.createElement('span');
    cost.classList.add('cost');
    var name = document.createElement('span');
    name.classList.add('name');
    var type = document.createElement('span');
    type.classList.add('type');
    var description = document.createElement('div');
    description.classList.add('description');
    var highlight = document.createElement('div');
    highlight.classList.add(`${typeText.toLocaleLowerCase()}Highlight`);
    highlight.classList.add('highlight');
    var cardArt = document.createElement('div');
    cardArt.classList.add('cardArt');

    type.textContent = typeText;
    cost.textContent = cardObj.buyCost;
    name.textContent = cardObj.name;
    var descriptionBody = cardObj.description;
    descriptionBody = descriptionBody.replace('[mana]', "<img class='descriptionIcon' src='./res/img/mana.png'/>");
    descriptionBody = descriptionBody.replace('[gold]', "<img class='descriptionIcon' src='./res/img/gold.png'/>");
    description.innerHTML = descriptionBody;
    //cardArt.style.backgroundImage = `url(../res/img/cards/${cardObj.name.toLowerCase()}.png)`;
    contentContainer.appendChild(cost);
    contentContainer.appendChild(name);
    contentContainer.appendChild(type);
    contentContainer.appendChild(description);
    cardElt.appendChild(highlight);
    cardElt.appendChild(cardArt);
    cardElt.appendChild(contentContainer);
    return cardElt;
}

function createCardBack() {
    var cardElt = document.createElement('div');
    cardElt.classList.add('cardBack');
    return cardElt;
}

function highlightCards(type, value='green') {
    type = type.toLocaleLowerCase();
    var root = document.querySelector(':root');

    if (type == 'all') {
        root.style.setProperty(`--spell-highlight-color`, value);
        root.style.setProperty(`--resource-highlight-color`, value);
    } else {
        root.style.setProperty(`--spell-highlight-color`,  'transparent');
        root.style.setProperty(`--resource-highlight-color`, 'transparent');
        root.style.setProperty(`--${type}-highlight-color`, value);
    }
}