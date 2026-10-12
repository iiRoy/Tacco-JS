function processValuePairs(valueSequence, currentOffset) {
    if (currentOffset >= valueSequence.length - 1 ||
        (valueSequence[currentOffset] * valueSequence[currentOffset + 1]) === 0) {
        return;
    }

    const firstElement = valueSequence[currentOffset];
    const secondElement = valueSequence[currentOffset + 1];

    const firstElementSquared = firstElement * firstElement;

    const computedResult = firstElement * Math.sqrt(4 * secondElement * secondElement + firstElementSquared) + firstElementSquared;

    console.log(computedResult);

    processValuePairs(valueSequence, currentOffset + 2);
}

const numericDataArray = input.split(/\s/).map(Number);

processValuePairs(numericDataArray, 0);
