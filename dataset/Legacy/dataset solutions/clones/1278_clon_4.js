const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const receivedLines = fileContent.split('\n');
receivedLines.shift(); // Discard the first line as per original logic

const presentCards = new Set(receivedLines.filter(line => line.trim() !== ''));

const cardSuits = ['S', 'H', 'C', 'D'];
const cardRanks = Array.from({ length: 13 }, (_, idx) => idx + 1);

const missingCards = cardSuits.reduce((accumulator, currentSuit) => {
    cardRanks.forEach(currentRank => {
        const potentialCard = `${currentSuit} ${currentRank}`;
        if (!presentCards.has(potentialCard)) {
            accumulator.push(potentialCard);
        }
    });
    return accumulator;
}, []);

const outputString = missingCards.join('\n');

if (outputString.length > 0) {
    console.log(outputString);
}
