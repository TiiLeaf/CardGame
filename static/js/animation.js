var exCard = { name: "Example Card", type: 1, buyCost: 1, description: "Win the game." };
var animLength = 300;
var animationInProgress = false;

function multiDrawAnimation(cards, i = 0) {
    if (i >= cards.length)
        return;
    drawAnimation(cards[i]);
    setTimeout(() => {
        multiDrawAnimation(cards, i + 1)
    }, animLength + 1);
}

function drawAnimation(cardObj) {
    //subtract from deck count
    domHandles.playerDeckCount.textContent = Number(domHandles.playerDeckCount.textContent) - 1;
    //animate a visual copy from deck to hand
    var cardElt = createCard(cardObj);
    var visualCopy = createVisualCopy(cardElt, -50, window.innerHeight - 185);
    var toCoords = getCoordsForNewChild(domHandles.playerHand);
    visualCopy.style.transform = "scale(0.3)";
    visualCopy.animate({
        top: `${toCoords.top}px`,
        left: `${toCoords.left}px`,
        transform: 'scale(1)'
    }, { duration: animLength / 2, fill: 'forwards' });

    //push the hand cards out of the way
    var temp = document.createElement('div');
    temp.classList.add('card');
    temp.style.width = "0px";
    domHandles.playerHand.prepend(temp);
    temp.animate({
        width: '192px',
    }, {duration: animLength/2, fill: 'forwards'});

    //end of animation
    setTimeout(() => {
        addMouseEvents(cardElt, cardObj);
        domHandles.playerHand.prepend(cardElt);
        visualCopy.remove();
        temp.remove();
    }, animLength);
}

function discardEntireHandAnimation() {
    for (var cardElt of domHandles.playerHand.children)
        discardFromHandAnimation(cardElt);

    setTimeout(() => {
        domHandles.playerHand.innerHTML = "";
    }, animLength);
}

function discardFromHandAnimation(cardElt) {
    cardElt.animate({
        opacity: '0%',
        transform: 'scale(0.7) translate(-32px, 0px)'
    }, { duration: animLength / 2, fill: 'forwards' });
    setTimeout(() => {
        cardElt.remove();
    }, animLength);
}

function discardTableAnimation() {
    for (var cardElt of domHandles.table.children) {
        cardElt.animate({
            opacity: '0%',
            transform: 'scale(0.7) translate(-32px, 0px)'
        }, { duration: animLength / 2, fill: 'forwards' });
    }
    setTimeout(() => {
        domHandles.table.innerHTML = "";
    }, animLength);
}

function enemyPlayAnimation(cardObj) {
    var cardElt = createCard(cardObj);
    cardElt.style.transform = 'scale(0.7)';
    cardElt.style.zIndex = 1;
    domHandles.table.appendChild(cardElt);
}

function playAnimation(cardElt) {
    animationInProgress = true;
    var cardCopy = cardElt.cloneNode(true);
    removeMouseEvents(cardCopy);    
    cardCopy.style.transform = 'scale(0.7)';
    cardCopy.style.transform = 'left top';

    //animate a visual copy from hand to table
    var fromCoords = cardElt.getBoundingClientRect();
    var toCoords = getCoordsForNewChild(domHandles.table, false);
    var visualCopy = createVisualCopy(cardElt, fromCoords.left, fromCoords.top);
    removeMouseEvents(visualCopy); //remove the mouse events from the played card
    visualCopy.animate({
        top: `${toCoords.top}px`,
        left: `${toCoords.left}px`,
        transform: 'scale(0.7)'
    }, { duration: animLength / 2, fill: 'forwards' });

    //slide the other hand cards to fill the gap
    cardElt.style.opacity = 0;
    cardElt.animate({
        width: '0',
    }, {duration: animLength/2, fill: 'forwards'});

    //end of animation
    setTimeout(() => {
        visualCopy.remove();
        cardElt.remove();
        domHandles.table.appendChild(cardCopy);
        animationInProgress = false;
    }, animLength);

}

function createVisualCopy(cardElt, x, y) {
    var copy = cardElt.cloneNode(true);
    copy.style.position = "fixed";
    copy.style.top = y + "px";
    copy.style.left = x + "px";
    document.body.appendChild(copy);
    return copy;
}

function getCoordsForNewChild(parent, before=true) {
    var temp = document.createElement('div');
    temp.classList.add('card');
    if (!before)
        parent.appendChild(temp);
    else
        parent.prepend(temp);
    var coords = temp.getBoundingClientRect();
    temp.remove();
    return coords;
}

function addMouseEvents(cardElt, cardObj) {
    cardElt.style.zIndex = 1;
    cardElt.style.transitionProperty = 'transform';
    cardElt.setAttribute('onmouseover', "this.style.zIndex=999;");
    cardElt.setAttribute('onmouseout', "this.style.zIndex=1;");
    cardElt.addEventListener('click', (e) => {
        cardClicked(cardObj, e.target.parentElement);
    });
}

function removeMouseEvents(cardElt) {
    cardElt.removeChild(cardElt.firstChild); //remove the outline
    cardElt.style.zIndex = 1;
    cardElt.style.transitionProperty = 'none';
    cardElt.setAttribute('onmouseover', '');
    cardElt.setAttribute('onmouseout', '');
    cardElt.removeEventListener('click', cardClicked);
}

function highlightCards(type, value='green') {
    type = type.toLocaleLowerCase();
    var root = document.querySelector(':root');

    if (type == 'hand') {
        root.style.setProperty(`--spell-highlight-color`, value);
        root.style.setProperty(`--resource-highlight-color`, value);
    } else {
        root.style.setProperty(`--spell-highlight-color`,  'transparent');
        root.style.setProperty(`--resource-highlight-color`, 'transparent');
        root.style.setProperty(`--${type}-highlight-color`, value);
    }
}

function highlightShopCards(maxCost) {
    var allShopCards = [...domHandles.spellShop.children].concat([...domHandles.resourceShop.children]);
    for (var cardElt of allShopCards) {
        cardElt.style.filter = `brightness(100%)`;
    }
    for (var cardElt of allShopCards) {
        if (Number(cardElt.children[1].children[0].textContent) > maxCost) {
            cardElt.style.filter = `brightness(66%)`;
        }
    }
}

function buyAnimation(cardElt) {
    cardElt.children[1].lastChild.textContent = Number(cardElt.children[1].lastChild.textContent) - 1;

    var fromCoords = cardElt.getBoundingClientRect();
    var visualCopy = createVisualCopy(cardElt, fromCoords.left, fromCoords.top);
    visualCopy.children[1].removeChild(visualCopy.children[1].lastChild);
    visualCopy.style.zIndex = 999;
    visualCopy.style.transformOrigin = "top left";
    visualCopy.animate({
        transform: 'scale(1.2) translate(-32px, -20px)',
        opacity: 0
    }, { duration: animLength, fill: 'forwards' });

    
    //end of animation
    setTimeout(() => {
        visualCopy.remove();
    }, animLength);
}