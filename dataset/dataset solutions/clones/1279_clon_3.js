'use strict'

const processInput = (rawData) => {
    const trimmedData = rawData.trim();
    const inputLines = trimmedData.split("\n");

    const numberOfCardsProvidedStr = inputLines[0];
    const numberOfCardsProvided = Number.parseInt(numberOfCardsProvidedStr, 10);

    const providedCardStrings = inputLines.slice(1, 1 + numberOfCardsProvided);
    const providedCardSet = new Set(providedCardStrings);

    const allStandardCards = [];
    const standardSuits = ["S", "H", "C", "D"];
    const minimumRank = 1;
    const maximumRank = 13;

    for (const currentSuit of standardSuits) {
        for (let currentRank = minimumRank; currentRank <= maximumRank; currentRank++) {
            const cardRepresentation = `${currentSuit} ${currentRank}`;
            allStandardCards.push(cardRepresentation);
        }
    }

    const missingCardList = allStandardCards.filter(potentialCard => {
        return !providedCardSet.has(potentialCard);
    });

    if (missingCardList.length > 0) {
        console.log(missingCardList.join("\n"));
    }
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
