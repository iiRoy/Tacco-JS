const rawSourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = rawSourceData.trim().split('\n');

const aggregateNumbers = (numericArray) => numericArray.reduce((currentSum, value) => currentSum + value, 0);

const handleExchangeScenario = (primaryDataset, secondaryDataset) => {
    const primaryTotal = aggregateNumbers(primaryDataset);
    const secondaryTotal = aggregateNumbers(secondaryDataset);

    const secondaryLookup = new Set(secondaryDataset);

    if (primaryTotal === secondaryTotal) {
        // When sums are equal, seek the smallest common element
        const orderedPrimary = [...primaryDataset].sort((valA, valB) => valA - valB);
        let mutualItem = -1;
        for (const elementP of orderedPrimary) {
            if (secondaryLookup.has(elementP)) {
                mutualItem = elementP;
                break;
            }
        }
        return mutualItem === -1 ? '-1' : `${mutualItem} ${mutualItem}`;
    }

    if ((primaryTotal + secondaryTotal) % 2 !== 0) {
        // If combined sum is odd, no integer swap can equalize
        return '-1';
    }

    const targetEqualSum = (primaryTotal + secondaryTotal) / 2;
    let chosenPrimaryItem = null;
    let chosenSecondaryItem = null;
    let leastCombinedValue = Infinity;

    primaryDataset.forEach(itemFromPrimary => {
        // The condition for equal sums after swap:
        // primaryTotal - itemFromPrimary + itemForSecondary = targetEqualSum
        // itemForSecondary = targetEqualSum - primaryTotal + itemFromPrimary
        const requiredItemForSecondary = targetEqualSum - primaryTotal + itemFromPrimary;

        if (secondaryLookup.has(requiredItemForSecondary)) {
            const currentCombined = itemFromPrimary + requiredItemForSecondary;
            if (currentCombined < leastCombinedValue) {
                leastCombinedValue = currentCombined;
                chosenPrimaryItem = itemFromPrimary;
                chosenSecondaryItem = requiredItemForSecondary;
            }
        }
    });

    if (chosenPrimaryItem === null) {
        return '-1';
    } else {
        return `${chosenPrimaryItem} ${chosenSecondaryItem}`;
    }
};

const processAllCases = (remainingInputSegments, collectedOutputs = []) => {
    if (remainingInputSegments.length < 2) { // Need at least two lines for counts and data
        return collectedOutputs.forEach(result => console.log(result));
    }

    const currentHeaderLine = remainingInputSegments.shift().trim();
    if (!currentHeaderLine) { // Skip empty lines if any
        return processAllCases(remainingInputSegments, collectedOutputs);
    }

    const dimensionValues = currentHeaderLine.split(' ').map(s => +s);
    const firstCollectionSize = dimensionValues[0];
    const secondCollectionSize = dimensionValues[1];

    if (firstCollectionSize === 0 && secondCollectionSize === 0) { // Common termination for some problems
        return collectedOutputs.forEach(result => console.log(result));
    }

    const primaryElements = [];
    while (primaryElements.length < firstCollectionSize && remainingInputSegments.length > 0) {
        primaryElements.push(+(remainingInputSegments.shift().trim()));
    }

    const secondaryElements = [];
    while (secondaryElements.length < secondCollectionSize && remainingInputSegments.length > 0) {
        secondaryElements.push(+(remainingInputSegments.shift().trim()));
    }

    const caseOutcome = handleExchangeScenario(primaryElements, secondaryElements);
    collectedOutputs.push(caseOutcome);

    return processAllCases(remainingInputSegments, collectedOutputs);
};

// Start the processing chain
processAllCases(processedLines);