function findValueIndex(sortedValues, targetValue) {
    if (sortedValues.length === 0) {
        return -1;
    }

    let currentPosition = 0;

    while (
        currentPosition < sortedValues.length &&
        sortedValues[currentPosition] < targetValue
    ) {
        currentPosition += 1;
    }

    const valueWasFound =
        currentPosition < sortedValues.length &&
        sortedValues[currentPosition] === targetValue;

    return valueWasFound
        ? currentPosition
        : -1;
}