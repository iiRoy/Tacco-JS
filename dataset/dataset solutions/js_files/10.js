function calculateWindowMaximums(values, windowSize) {
    if (
        windowSize <= 0 ||
        windowSize > values.length
    ) {
        return [];
    }

    const maximums = [];

    for (
        let startingPosition = 0;
        startingPosition <= values.length - windowSize;
        startingPosition++
    ) {
        let maximumValue = -Infinity;

        for (
            let offset = 0;
            offset < windowSize;
            offset++
        ) {
            const currentValue =
                values[startingPosition + offset];

            if (currentValue > maximumValue) {
                maximumValue = currentValue;
            }
        }

        maximums.push(maximumValue);
    }

    return maximums;
}