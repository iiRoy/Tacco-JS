function calculateTrappedWater(heights) {
    if (heights.length < 3) {
        return 0;
    }

    const maximumLeftHeights =
        new Array(heights.length);

    const maximumRightHeights =
        new Array(heights.length);

    maximumLeftHeights[0] = heights[0];

    for (
        let position = 1;
        position < heights.length;
        position++
    ) {
        maximumLeftHeights[position] = Math.max(
            maximumLeftHeights[position - 1],
            heights[position]
        );
    }

    const lastPosition = heights.length - 1;

    maximumRightHeights[lastPosition] =
        heights[lastPosition];

    for (
        let position = lastPosition - 1;
        position >= 0;
        position--
    ) {
        maximumRightHeights[position] = Math.max(
            maximumRightHeights[position + 1],
            heights[position]
        );
    }

    let totalWater = 0;

    for (
        let position = 1;
        position < lastPosition;
        position++
    ) {
        const supportedHeight = Math.min(
            maximumLeftHeights[position],
            maximumRightHeights[position]
        );

        if (supportedHeight <= heights[position]) {
            continue;
        }

        totalWater +=
            supportedHeight - heights[position];
    }

    return totalWater;
}