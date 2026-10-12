function readInputLines() {
    const fileSystemModule = require("fs");
    const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    const processedLines = rawInputContent.split(/\n\r?/);
    return processedLines;
}

function generateSequence(startValue, endValue) {
    const sequenceContainer = [];
    let currentNumber = startValue;
    while (currentNumber <= endValue) {
        sequenceContainer.push(currentNumber);
        currentNumber++;
    }
    return sequenceContainer;
}

const initialSuitRanks = 13;
const initialCardSet = {
    S: generateSequence(1, initialSuitRanks),
    H: generateSequence(1, initialSuitRanks),
    C: generateSequence(1, initialSuitRanks),
    D: generateSequence(1, initialSuitRanks)
};
let cardSetTracker = initialCardSet;

const inputDataLines = readInputLines();
const relevantInputLines = inputDataLines.slice(1);

relevantInputLines.forEach(function(inputLine) {
    const cardDetails = inputLine.split(' ');
    const suitIdentifier = cardDetails[0];
    const rankValue = parseInt(cardDetails[1], 10);
    const arrayIndex = rankValue - 1;

    if (cardSetTracker[suitIdentifier]) {
        delete cardSetTracker[suitIdentifier][arrayIndex];
    }
});

function formatSuitCards(suitKey, cardArray) {
    const existingCards = cardArray.filter(cardValue => cardValue !== undefined && cardValue !== null);
    const formattedStrings = existingCards.map(cardRank => `${suitKey} ${cardRank}`);
    return formattedStrings.join("\n");
}

const suitOrder = ['S', 'H', 'C', 'D'];

for (const currentSuitKey of suitOrder) {
    const currentSuitCards = cardSetTracker[currentSuitKey];
    if (currentSuitCards) {
        const outputBlock = formatSuitCards(currentSuitKey, currentSuitCards);
        if (outputBlock) {
            console.log(outputBlock);
        }
    }
}
