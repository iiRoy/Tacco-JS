function calculateWindowMaximums(values, windowSize) {
    if (
        values.length === 0 ||
        windowSize < 1 ||
        windowSize > values.length
    ) {
        return [];
    }

    const maximums = [];

    for (
        let endingPosition = windowSize - 1;
        endingPosition < values.length;
        endingPosition++
    ) {
        const startingPosition =
            endingPosition - windowSize + 1;

        let currentPosition =
            startingPosition + 1;

        let maximumValue =
            values[startingPosition];

        while (currentPosition <= endingPosition) {
            maximumValue = Math.max(
                maximumValue,
                values[currentPosition]
            );

            currentPosition += 1;
        }

        maximums[maximums.length] =
            maximumValue;
    }

    return maximums;
}