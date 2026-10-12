function determineMaximumCoveredArea(histogram) {
    const increasingBarIndexes = [];

    let largestArea = 0;

    for (
        let currentIndex = 0;
        currentIndex <= histogram.length;
        currentIndex++
    ) {
        const currentHeight =
            currentIndex === histogram.length
                ? 0
                : histogram[currentIndex];

        while (
            increasingBarIndexes.length > 0 &&
            histogram[
                increasingBarIndexes[
                    increasingBarIndexes.length - 1
                ]
            ] > currentHeight
        ) {
            const removedIndex =
                increasingBarIndexes.pop();

            const rectangleHeight =
                histogram[removedIndex];

            const previousSmallerIndex =
                increasingBarIndexes.length === 0
                    ? -1
                    : increasingBarIndexes[
                        increasingBarIndexes.length - 1
                    ];

            const rectangleWidth =
                currentIndex -
                previousSmallerIndex -
                1;

            const rectangleArea =
                rectangleHeight * rectangleWidth;

            if (rectangleArea > largestArea) {
                largestArea = rectangleArea;
            }
        }

        increasingBarIndexes.push(currentIndex);
    }

    return largestArea;
}