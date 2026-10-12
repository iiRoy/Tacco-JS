function obtainAbsentValue(sequence) {
    const sortedSequence = sequence
        .slice()
        .sort((leftValue, rightValue) => leftValue - rightValue);

    for (
        let currentPosition = 0;
        currentPosition < sortedSequence.length;
        currentPosition++
    ) {
        if (sortedSequence[currentPosition] !== currentPosition) {
            return currentPosition;
        }
    }

    return sortedSequence.length;
}