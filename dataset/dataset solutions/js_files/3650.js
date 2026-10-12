function calculateTrappedWater(heights) {
    let totalWater = 0;

    for (
        let currentPosition = 1;
        currentPosition < heights.length - 1;
        currentPosition++
    ) {
        let maximumLeftHeight = 0;
        let maximumRightHeight = 0;

        for (
            let leftPosition = 0;
            leftPosition < currentPosition;
            leftPosition++
        ) {
            maximumLeftHeight = Math.max(
                maximumLeftHeight,
                heights[leftPosition]
            );
        }

        for (
            let rightPosition = currentPosition + 1;
            rightPosition < heights.length;
            rightPosition++
        ) {
            maximumRightHeight = Math.max(
                maximumRightHeight,
                heights[rightPosition]
            );
        }

        const waterLevel = Math.min(
            maximumLeftHeight,
            maximumRightHeight
        );

        const waterAtCurrentPosition = Math.max(
            0,
            waterLevel - heights[currentPosition]
        );

        totalWater += waterAtCurrentPosition;
    }

    return totalWater;
}