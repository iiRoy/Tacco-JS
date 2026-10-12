function findValueIndex(sortedValues, targetValue) {
    for (let i = 0; i < sortedValues.length; i++) {
        if (sortedValues[i] === targetValue) {
            return i;
        }

        if (sortedValues[i] > targetValue) {
            break;
        }
    }

    return -1;
}