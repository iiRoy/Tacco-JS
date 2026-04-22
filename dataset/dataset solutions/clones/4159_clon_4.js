const fileSystem = require('fs');

function calculateDiscrepancySum(frequencyRegister) {
    let accumulatedValue = 0;

    const mapEntriesAsList = Array.from(frequencyRegister.entries());

    function processEntriesRecursively(remainingEntries, currentTotal) {
        if (remainingEntries.length === 0) {
            return currentTotal;
        }

        const [itemIdentity, itemQuantity] = remainingEntries[0];
        let updatedTotal = currentTotal;

        if (itemIdentity !== itemQuantity) {
            if (itemIdentity < itemQuantity) {
                updatedTotal += itemQuantity - itemIdentity;
            } else {
                updatedTotal += itemQuantity;
            }
        }
        return processEntriesRecursively(remainingEntries.slice(1), updatedTotal);
    }

    return processEntriesRecursively(mapEntriesAsList, 0);
}

function processInputContent(fullInputText) {
    const contentRows = fullInputText.trim().split('\n');
    const numericalSeries = contentRows[1].split(" ").map(entryVal => Number(entryVal));

    const occurrenceCollection = numericalSeries.reduce((accumulatorMap, currentElement) => {
        accumulatorMap.set(currentElement, (accumulatorMap.get(currentElement) || 0) + 1);
        return accumulatorMap;
    }, new Map());

    const finalSummation = calculateDiscrepancySum(occurrenceCollection);
    console.log(finalSummation);
}

try {
    const capturedInputText = fileSystem.readFileSync('/dev/stdin', 'utf8');
    processInputContent(capturedInputText);
} catch (inputError) {
    console.error("Input reading error:", inputError);
}