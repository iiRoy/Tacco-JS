function calculateLargestRectangle(heights) {
    if (heights.length === 0) {
        return 0;
    }

    let maximumArea = 0;

    for (
        let startingPosition = 0;
        startingPosition < heights.length;
        startingPosition++
    ) {
        let minimumHeight =
            heights[startingPosition];

        let endingPosition =
            startingPosition;

        while (endingPosition < heights.length) {
            const currentHeight =
                heights[endingPosition];

            if (currentHeight < minimumHeight) {
                minimumHeight = currentHeight;
            }

            const rectangleWidth =
                endingPosition - startingPosition + 1;

            maximumArea = Math.max(
                maximumArea,
                minimumHeight * rectangleWidth
            );

            endingPosition += 1;
        }
    }

    return maximumArea;
}