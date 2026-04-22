const obtainInputLines = () => {
    if (typeof require === 'undefined' || !require('fs')) {
        console.error("Critical: 'fs' module is unavailable. Cannot read input.");
        return [];
    }
    const fileModule = require("fs");
    const rawBufferContent = fileModule.readFileSync("/dev/stdin", "utf8");
    const separatedTextBlocks = rawBufferContent.split(/[\r\n]+/);
    return separatedTextBlocks.filter(block => block.trim() !== '');
};

const buildIntegerSequence = (lowerBound, upperBound) => {
    if (lowerBound > upperBound) {
        console.warn(`Input bounds are inverted: ${lowerBound} > ${upperBound}. Returning an empty range.`);
        return [];
    }
    const generatedSeries = [];
    let currentNumber = lowerBound;
    do {
        generatedSeries.push(currentNumber);
        currentNumber++;
    } while (currentNumber <= upperBound);
    return generatedSeries;
};

let cardCollectionStatus = {
    'S': buildIntegerSequence(1, 13),
    'H': buildIntegerSequence(1, 13),
    'C': buildIntegerSequence(1, 13),
    'D': buildIntegerSequence(1, 13)
};

const processedInputData = obtainInputLines();

if (processedInputData.length > 1) {
    for (let currentEntryIdx = 1; currentEntryIdx < processedInputData.length; currentEntryIdx++) {
        const currentDataEntry = processedInputData[currentEntryIdx];

        if (!currentDataEntry || currentDataEntry.trim() === '') {
            continue;
        }

        const components = currentDataEntry.split(/\s+/).filter(Boolean);

        if (components.length !== 2) {
            console.warn(`Skipping malformed input entry: "${currentDataEntry}". Expected 'SUIT RANK'.`);
            continue;
        }

        const cardSuitIdentifier = components[0].toUpperCase();
        const cardRankString = components[1];

        const cardRankValue = Number(cardRankString);

        const isValidSuit = cardCollectionStatus.hasOwnProperty(cardSuitIdentifier);
        const isValidRank = !isNaN(cardRankValue) && cardRankValue >= 1 && cardRankValue <= 13;

        if (!isValidSuit || !isValidRank) {
            console.warn(`Ignoring invalid card data: Suit '${cardSuitIdentifier}', Rank '${cardRankString}'.`);
            continue;
        }

        const targetSuitArray = cardCollectionStatus[cardSuitIdentifier];
        const positionOfCard = targetSuitArray.indexOf(cardRankValue);

        if (positionOfCard !== -1) {
            targetSuitArray.splice(positionOfCard, 1);
        }
    }
} else {
    console.log("No card data provided for processing (or only count line present).");
}

/*
const suitCategories = Object.keys(cardCollectionStatus);

suitCategories.forEach(currentSuitKey => {
    const extantRanks = cardCollectionStatus[currentSuitKey];

    if (extantRanks.length > 0) {
        let cardOutputFragments = [];
        for (let idx = 0; idx < extantRanks.length; idx++) {
            const rankToDisplay = extantRanks[idx];
            cardOutputFragments.push(`${currentSuitKey} ${rankToDisplay}`);
        }
        // console.log(cardOutputFragments.join('\n'));
    }
});
*/