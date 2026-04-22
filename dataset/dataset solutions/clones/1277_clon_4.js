function obtainInputData() {
    const rawContent = require('fs').readFileSync(0, 'ascii');
    const contentSegments = rawContent.split('\n');
    const cardCount = parseInt(contentSegments[0], 10);
    const omittedCardRepresentations = Array.from({ length: cardCount }, (_, index) => contentSegments[index + 1]);
    return omittedCardRepresentations;
}

function constructOrderedDeck() {
    const suitDesignators = ['S', 'H', 'C', 'D'];
    const completeCardCollection = [];

    suitDesignators.forEach(function(currentSuitSymbol) {
        Array.from({ length: 13 }, (_, rankIndex) => rankIndex + 1).forEach(function(currentRankValue) {
            completeCardCollection.push(`${currentSuitSymbol} ${currentRankValue}`);
        });
    });
    return completeCardCollection;
}

function processAndDisplayCards() {
    const cardsToExclude = obtainInputData();
    
    const excludedCardSet = new Set(cardsToExclude); 

    const entireDeckInSequence = constructOrderedDeck();

    entireDeckInSequence.forEach(function(singleCardIdentity) {
        if (!excludedCardSet.has(singleCardIdentity)) {
            console.log(singleCardIdentity);
        }
    });
}

processAndDisplayCards();