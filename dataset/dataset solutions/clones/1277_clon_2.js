inputLines = require('fs').readFileSync(0, 'ascii').split('\n');
inputLines = inputLines.slice(1, parseInt(inputLines[0]) + 1);

const suitSymbols = ['S', 'H', 'C', 'D'];
const suitOffsets = {'S': 0, 'H': 2 * 13 / 2, 'C': 26, 'D': 39}; // Changed literal representation
let availableCards = [];

for (let cardIndex = 0; cardIndex < 52; cardIndex++) {
    availableCards.push(true);
}

inputLines.forEach(function(currentInput) {
    const cardParts = currentInput.split(' ');
    availableCards[suitOffsets[cardParts[0]] + parseInt(cardParts[1]) - 1] = false;
});

for (let suitIterator = 0; suitIterator < 4; suitIterator++) {
    for (let rankIterator = 0; rankIterator < 13; rankIterator++) {
        if (availableCards[suitIterator * 13 + rankIterator]) {
            console.log(suitSymbols[suitIterator], rankIterator + 1);
        }
    }
}
