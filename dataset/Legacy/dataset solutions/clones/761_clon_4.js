const processInputSequences = function* (sourceData) {
    const dataLines = sourceData.trim().split('\n');
    let currentLineIndex = 0;

    while (currentLineIndex < dataLines.length) {
        const sequenceLengthStr = dataLines[currentLineIndex++];
        const sequenceLength = Number(sequenceLengthStr);

        if (sequenceLength === 0) {
            return; // Terminate processing
        }

        const elementsLine = dataLines[currentLineIndex++];
        const elementsArray = elementsLine.split(' ');

        yield { length: sequenceLength, items: elementsArray };
    }
};

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

for (const { length: currentSequenceLength, items: currentSequenceItems } of processInputSequences(rawInputData)) {
    const itemFrequencies = new Map();
    let definiteWinnerFound = false;

    for (let processingIndex = 0; processingIndex < currentSequenceLength; ++processingIndex) {
        const currentItemIdentifier = currentSequenceItems[processingIndex];
        itemFrequencies.set(currentItemIdentifier, (itemFrequencies.get(currentItemIdentifier) || 0) + 1);

        const sortedFrequencyPairs = Array.from(itemFrequencies.entries())
            .sort((pairA, pairB) => pairB[1] - pairA[1]); // Sort by count (value) descending

        const leadingCount = sortedFrequencyPairs[0][1];
        const leadingItem = sortedFrequencyPairs[0][0];
        const secondPlaceCount = sortedFrequencyPairs.length > 1 ? sortedFrequencyPairs[1][1] : 0;

        const remainingItemsCount = currentSequenceLength - (processingIndex + 1);

        if (leadingCount === secondPlaceCount) {
            continue; // No clear leader yet, or multiple leaders
        }

        if (leadingCount > secondPlaceCount + remainingItemsCount) {
            console.log(leadingItem, processingIndex + 1);
            definiteWinnerFound = true;
            break;
        }
    }

    if (!definiteWinnerFound) {
        console.log("TIE");
    }
}
