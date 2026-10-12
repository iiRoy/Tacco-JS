const inputSource = require('fs').readFileSync(0, 'ascii');
const allInputLines = inputSource.split('\n');

const totalCardSpecifications = Number(allInputLines[0]);
const cardRemovalSpecifications = allInputLines.slice(1, totalCardSpecifications + 1);

const suitDesignations = ['S', 'H', 'C', 'D'];

const deriveCardIndex = (symbol, rank) => {
    const baseOffset = suitDesignations.indexOf(symbol) * 13;
    return baseOffset + Number(rank) - 1;
};

const availableCardIndices = new Set(Array.from({ length: 52 }, (_, idx) => idx));

cardRemovalSpecifications.forEach(specLine => {
    const [cardSymbol, cardRank] = specLine.split(' ');
    const cardIdentifier = deriveCardIndex(cardSymbol, cardRank);
    availableCardIndices.delete(cardIdentifier);
});

const remainingCardIdentifiers = Array.from(availableCardIndices).sort((a, b) => a - b);

remainingCardIdentifiers.forEach(identifier => {
    const currentSuitIndex = Math.floor(identifier / 13);
    const currentRankValue = (identifier % 13) + 1;
    console.log(suitDesignations[currentSuitIndex], currentRankValue);
});
