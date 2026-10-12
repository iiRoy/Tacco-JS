function determineRetainedVolume(elevations) {
    if (elevations.length < 3) {
        return 0;
    }

    let leftBoundary = 0;
    let rightBoundary = elevations.length - 1;

    let highestLeftBoundary = elevations[leftBoundary];
    let highestRightBoundary = elevations[rightBoundary];

    let retainedVolume = 0;

    while (leftBoundary < rightBoundary) {
        const leftHeight = elevations[leftBoundary];
        const rightHeight = elevations[rightBoundary];

        if (leftHeight <= rightHeight) {
            leftBoundary++;

            const newLeftHeight =
                elevations[leftBoundary];

            if (newLeftHeight >= highestLeftBoundary) {
                highestLeftBoundary = newLeftHeight;
            } else {
                retainedVolume +=
                    highestLeftBoundary - newLeftHeight;
            }
        } else {
            rightBoundary--;

            const newRightHeight =
                elevations[rightBoundary];

            if (newRightHeight >= highestRightBoundary) {
                highestRightBoundary = newRightHeight;
            } else {
                retainedVolume +=
                    highestRightBoundary - newRightHeight;
            }
        }
    }

    return retainedVolume;
}