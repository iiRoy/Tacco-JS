function determineOrderedLocation(values, desiredValue) {
    let lowerBoundary = 0;
    let upperBoundary = values.length - 1;

    while (lowerBoundary <= upperBoundary) {
        const middlePosition = Math.floor(
            (lowerBoundary + upperBoundary) / 2
        );

        const middleValue = values[middlePosition];

        if (middleValue === desiredValue) {
            return middlePosition;
        }

        if (middleValue < desiredValue) {
            lowerBoundary = middlePosition + 1;
        } else {
            upperBoundary = middlePosition - 1;
        }
    }

    return -1;
}