var exCard = { name: "Example Card", type: 1, buyCost: 1, description: "Win the game." };
var animLength = 250;

function multiDraw(cards, i = 0) {
    if (i >= cards.length)
        return;
    draw(cards[i]);
    setTimeout(()=>{
        multiDraw(cards, i+1)
    }, animLength);
}

function draw(card) {
    domHandles.playerDeckCount.textContent = Number(domHandles.playerDeckCount.textContent) - 1;
    var tmp = document.createElement('div');
    tmp.classList.add('card');
    domHandles.playerHand.prepend(tmp);
    var coords = tmp.getBoundingClientRect();
    tmp.style.width = "0px";

    var cardVisual = createCard(card);
    cardVisual.style.position = "fixed";
    cardVisual.style.bottom = "-73px";
    cardVisual.style.left = "-53px";
    cardVisual.style.transform = "scale(0.3)";
    document.body.appendChild(cardVisual);
    cardVisual.animate({
        left: `${coords.left}px`,
        bottom: `16px`,
        transform: "scale(1)"
    }, {duration: animLength, fill: 'forwards'});
    tmp.animate({
        width: '192px',
    }, {duration: animLength/2, fill: 'forwards'});

    setTimeout(() => {
        tmp.remove();
        cardVisual.remove();
        var newCard = createCard(card);
        newCard.style.zIndex = 1;
        newCard.setAttribute('onmouseover', "this.style.zIndex=999;")
        newCard.setAttribute('onmouseout', "this.style.zIndex=1;")
        newCard.addEventListener('click', (e) => {
            cardClicked(card, e.target.parentElement);
        });
        domHandles.playerHand.prepend(newCard);
    }, animLength)
}

function discard(cardElt) {
    var cardToDiscard = cardElt;
    var coords = cardToDiscard.getBoundingClientRect();
    var cardVisual = cardToDiscard.cloneNode(true);
    cardVisual.setAttribute('onmouseover', '');
    cardVisual.style.position = "fixed";
    cardVisual.style.left = coords.left+"px";
    cardVisual.style.top = coords.top+"px";
    cardVisual.style.transformOrigin = "bottom left";
    cardVisual.style.zIndex = "1";
    document.body.appendChild(cardVisual);
    //cardToPlay.style.opacity = '0';
    cardToDiscard.animate({
        width: `0px`,
    }, {duration: animLength/2, fill: 'forwards'});
    cardVisual.animate({
        left: `90px`,
        transform: "scale(0.3)",
    }, {duration: animLength, fill: 'forwards'});
    setTimeout(() => {
        cardToDiscard.remove();
        cardVisual.remove();
    }, animLength)
}

function play(cardToPlay) {
    console.log(cardToPlay);

    var fromCoords = cardToPlay.getBoundingClientRect();
    var tmp = document.createElement('div');
    tmp.classList.add('card');
    tmp.style.transform = `scale(0.65)`;
    domHandles.table.appendChild(tmp);
    var toCoords = tmp.getBoundingClientRect();
    tmp.remove();

    var cardVisual = cardToPlay.cloneNode(true);
    cardVisual.setAttribute('onmouseover', '');
    cardVisual.style.position = "fixed";
    cardVisual.style.left = fromCoords.left+"px";
    cardVisual.style.top = fromCoords.top+"px";
    cardVisual.style.zIndex = "1";
    document.body.appendChild(cardVisual);
    cardToPlay.style.opacity = '0';
    
    cardToPlay.animate({
        width: `0px`,
    }, {duration: animLength/2, fill: 'forwards'});
    cardVisual.animate({
        top: `${toCoords.top}px`,
        left: `${toCoords.left}px`,
        transform: `scale(0.65)`
    }, {duration: animLength, fill: 'forwards'});
    setTimeout(() => {
        cardToPlay.remove();
        cardVisual.remove();
        cardToPlay.style.opacity = '1';
        cardToPlay.style.transform = `scale(0.65)`;
        cardVisual.setAttribute('onmouseover', '');
        cardVisual.style.transformOrigin = 'bottom left';
        domHandles.table.appendChild(cardToPlay.cloneNode(true));
    }, animLength);
}

function cardClicked(card, elt) {
    //is it your turn
    if (!turn.isMyTurn)
        return;

    //trash is unplayable
    if (card.type == CardTypes.TRASH)
        return;

    //we are trying to buy a card
    if (turn.clickAction == 'buy') {
        tryToBuy(card, ()=>{
            //buy(elt); //animate
        });
    }

    //we are trying to play a card
    if (turn.clickAction == 'play') {
        if (card.type == CardTypes.SPELL && turn.phase != 0)
            return;
        if (card.type == CardTypes.RESOURCE && turn.phase != 1)
            return;

        tryToPlay(card, ()=>{
            play(elt);
        });
    }
}