const processNumericalSequence = (rawDataInput) => {
    if (typeof rawDataInput !== 'string' || rawDataInput.trim() === '') {
        console.error("Error: Input data stream is invalid or empty.");
        return NaN;
    }

    const cleanedLines = rawDataInput.trim().split(/\r?\n/);

    if (cleanedLines.length < 2 || !cleanedLines[1] || cleanedLines[1].trim() === '') {
        console.error("Error: The line containing numeric values is missing or empty.");
        return NaN;
    }

    let orderedValues = cleanedLines[1]
        .split(' ')
        .filter(entry => entry.trim() !== '')
        .map(str => Number(str.trim()));

    if (orderedValues.some(isNaN) || orderedValues.length === 0) {
        console.error("Error: Failed to parse a valid sequence of numbers from the input string.");
        return NaN;
    }

    orderedValues.sort((valA, valB) => valA - valB);

    if (orderedValues.length < 2) {
        console.warn("Warning: Insufficient numbers for averaging. Returning the single available value.");
        return orderedValues[0];
    }

    let evolvingAverage = (orderedValues[0] + orderedValues[1]) / 2;
    orderedValues.splice(0, 2); // Remove the two smallest values used for the initial average.

    let operationCount = 0; // Tracks the number of averaging operations performed.
    while (orderedValues.length > 0) {
        operationCount++;

        const insertionPoint = locatePositionInSortedCollection(orderedValues, evolvingAverage);
        orderedValues.splice(insertionPoint, 0, evolvingAverage); // Re-insert the average to maintain sorted order.

        if (orderedValues.length < 2) {
            break; // No more pairs to average.
        }

        evolvingAverage = (orderedValues[0] + orderedValues[1]) / 2;
        orderedValues.splice(0, 2); // Remove the next two smallest values.
    }

    return evolvingAverage; // The final consolidated average.
};

const locatePositionInSortedCollection = (sortedCollection, targetValue) => {
    if (!Array.isArray(sortedCollection) || sortedCollection.some(item => typeof item !== 'number' || isNaN(item))) {
        console.error("Error: Provided collection for binary search is invalid or contains non-numeric entries.");
        return 0; // Default to beginning if collection is fundamentally flawed.
    }

    if (sortedCollection.length === 0) {
        return 0; // Target would be inserted at index 0 in an empty collection.
    }

    let lowerBound = 0;
    let upperBound = sortedCollection.length - 1;

    while (lowerBound <= upperBound) {
        const midPoint = (lowerBound + upperBound) >>> 1; // Efficient integer division.
        const midValue = sortedCollection[midPoint];

        if (midValue === targetValue) {
            return midPoint; // Exact match found, return its index.
        } else if (midValue < targetValue) {
            lowerBound = midPoint + 1; // Target is in the right half.
        } else {
            upperBound = midPoint - 1; // Target is in the left half.
        }
    }

    // If no exact match is found, 'lowerBound' indicates the correct insertion point
    // to maintain the sorted order of the collection.
    return lowerBound;
};

try {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const finalResult = processNumericalSequence(fileContent);

    if (!isNaN(finalResult)) {
        console.log(finalResult);
    } else {
        console.error("Computation failed, no valid result available.");
    }
} catch (ioError) {
    console.error("An I/O error occurred while reading input:", ioError.message);
}