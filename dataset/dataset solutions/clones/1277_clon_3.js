const fileSystem = require('fs');

const rawInputContent = fileSystem.readFileSync(0, 'ascii');
const allInputLines = rawInputContent.split('\n');

const firstLineValue = allInputLines[0];
const numberOfCardsToProcess = parseInt(firstLineValue, 10);

const inputCardDescriptions = allInputLines.slice(1, numberOfCardsToProcess + 1);

const suitSymbols = ['S', 'H', 'C', 'D'];
const suitBaseValues = {
    'S': 0,
    'H': 13,
    'C': 26,
    'D': 39
};

const totalCardsInDeck = 52;
const availableCards = new Array(totalCardsInDeck).fill(true);

function getDeckIndex(suitCharacter, rankNumber) {
    const baseIndex = suitBaseValues[suitCharacter];
    const zeroBasedRank = rankNumber - 1;
    return baseIndex + zeroBasedRank;
}

inputCardDescriptions.forEach(function(cardDescriptionLine) {
    const cardParts = cardDescriptionLine.split(' ');
    const currentSuitChar = cardParts[0];
    const currentRankNum = parseInt(cardParts[1], 10);
    const cardDeckPosition = getDeckIndex(currentSuitChar, currentRankNum);
    availableCards[cardDeckPosition] = false;
});

const suitsCount = 4;
const ranksPerSuit = 13;

for (let suitIterator = 0; suitIterator < suitsCount; suitIterator++) {
    for (let rankIterator = 0; rankIterator < ranksPerSuit; rankIterator++) {
        const currentCardFlatIndex = (suitIterator * ranksPerSuit) + rankIterator;
        if (availableCards[currentCardFlatIndex]) {
            const displaySuitSymbol = suitSymbols[suitIterator];
            const displayRankValue = rankIterator + 1;
            console.log(displaySuitSymbol, displayRankValue);
        }
    }
}
