function calculateLargestRectangle(heights) {
    let maximumArea = 0;

    for (
        let startingPosition = 0;
        startingPosition < heights.length;
        startingPosition++
    ) {
        for (
            let endingPosition = startingPosition;
            endingPosition < heights.length;
            endingPosition++
        ) {
            let minimumHeight = Infinity;

            for (
                let currentPosition = startingPosition;
                currentPosition <= endingPosition;
                currentPosition++
            ) {
                minimumHeight = Math.min(
                    minimumHeight,
                    heights[currentPosition]
                );
            }

            const rectangleWidth =
                endingPosition - startingPosition + 1;

            const rectangleArea =
                minimumHeight * rectangleWidth;

            if (rectangleArea > maximumArea) {
                maximumArea = rectangleArea;
            }
        }
    }

    return maximumArea;
}