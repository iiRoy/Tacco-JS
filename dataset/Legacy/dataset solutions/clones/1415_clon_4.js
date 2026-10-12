function getInputData() {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    return fileContent.split(/\n\r?/);
}

function createNumberSequence(startValue, endValue) {
    return Array.from({ length: endValue - startValue + 1 }, (_, index) => startValue + index);
}

const suitSymbols = ['S', 'H', 'C', 'D'];
const deckState = new Map();

suitSymbols.forEach(symbol => {
    deckState.set(symbol, new Set(createNumberSequence(1, 13)));
});

getInputData().slice(1).forEach(currentLine => {
    const cardDetails = currentLine.split(' ');
    const suitIdentifier = cardDetails[0];
    const cardRank = parseInt(cardDetails[1], 10);
    
    const currentSuitSet = deckState.get(suitIdentifier);
    if (currentSuitSet) {
        currentSuitSet.delete(cardRank);
    }
});

for (const [suitIdentifier, rankSet] of deckState.entries()) {
    const remainingRanks = Array.from(rankSet).sort((a, b) => a - b);
    
    const formattedCards = remainingRanks.map(rankValue => `${suitIdentifier} ${rankValue}`).join('\n');
    
    console.log(formattedCards);
}
