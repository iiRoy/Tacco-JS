var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
var dataLines = sourceData.trim().split("\n");

let parseInputBlocks = (lines) => {
    let processedBlocks = [];
    let linePointer = 0;
    while (true) {
        let currentQuantity = parseInt(lines[linePointer++], 10);
        if (currentQuantity === 0) break;
        let currentElements = lines[linePointer++].split(" ");
        processedBlocks.push({ totalItems: currentQuantity, itemSequence: currentElements });
    }
    return processedBlocks;
};

let determineOutcomes = (inputBlockCollection) => {
    let finalResults = [];

    inputBlockCollection.forEach(blockEntry => {
        let { totalItems: blockTotal, itemSequence: blockItems } = blockEntry;

        let blockProcessingState = blockItems.reduce((accumulator, currentIdentifier, stepIndex) => {
            // If a definitive outcome has already been found for this block, bypass further processing
            if (accumulator.finalDecision) {
                return accumulator;
            }

            accumulator.currentIteration = stepIndex + 1; // 1-based step count

            // Update frequency map for the current item
            accumulator.frequencyMap.set(currentIdentifier, (accumulator.frequencyMap.get(currentIdentifier) || 0) + 1);

            // Convert map entries to an array and sort by frequency (ascending)
            let sortedFrequencyPairs = Array.from(accumulator.frequencyMap.entries())
                                             .sort((pairA, pairB) => pairA[1] - pairB[1]);

            let primaryCount = sortedFrequencyPairs[0][1];
            let primaryIdentifier = sortedFrequencyPairs[0][0];
            let secondaryCount = sortedFrequencyPairs.length > 1 ? sortedFrequencyPairs[1][1] : 0; // Default to 0 if only one distinct item

            let remainingItemsInBlock = blockTotal - accumulator.currentIteration;

            // Check if a clear winner has emerged
            if (primaryCount > secondaryCount + remainingItemsInBlock) {
                accumulator.finalDecision = `${primaryIdentifier} ${accumulator.currentIteration}`;
            }
            // If primaryCount === secondaryCount, it's a temporary tie, continue to next item.
            // This is implicitly handled by not setting finalDecision.

            return accumulator;
        }, {
            frequencyMap: new Map(),
            finalDecision: null, // Stores the winner string or remains null for a TIE
            currentIteration: 0
        });

        // After processing all items in the sequence (or short-circuiting)
        if (blockProcessingState.finalDecision) {
            finalResults.push(blockProcessingState.finalDecision);
        } else {
            finalResults.push("TIE");
        }
    });

    return finalResults;
};

let parsedInput = parseInputBlocks(dataLines);
let computedOutcomes = determineOutcomes(parsedInput);
computedOutcomes.forEach(resultLine => console.log(resultLine));
