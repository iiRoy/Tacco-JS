function processInput(dataPayload) {
    "use strict";
    const dataSegments = dataPayload.split("\n");
    const initialParameters = dataSegments[0].split(" ").map((val) => +val);
    const trackSize = initialParameters[0];
    const itemCount = initialParameters[1];

    let itemLocations = dataSegments.slice(1)
                                    .filter((val) => val.trim() !== '')
                                    .map((val) => +val)
                                    .sort((a, b) => a - b);

    // Memoization table: max_cost_for_segment[left_idx][right_idx][last_item_was_from_left_side_of_current_segment]
    // The third dimension (0 or 1) indicates whether the last collected item that "defined" the current robot's
    // position was to the left (0) or to the right (1) of the currently uncollected segment [left_idx, right_idx].
    // This allows us to determine the robot's current physical location.
    const memoTable = Array(itemCount + 1).fill(null).map(() =>
                      Array(itemCount + 1).fill(null).map(() =>
                      Array(2).fill(-1))); // -1 indicates not yet computed

    // Calculates clockwise distance on a circular track
    function getClockwiseDistance(startPoint, endPoint, circleLength) {
        return (endPoint - startPoint + circleLength) % circleLength;
    }

    // Calculates counter-clockwise distance on a circular track
    function getCounterClockwiseDistance(startPoint, endPoint, circleLength) {
        return (startPoint - endPoint + circleLength) % circleLength;
    }

    // Recursive function with memoization to find the maximum travel cost
    // currentLeftBound: index of the leftmost uncollected item in `itemLocations`
    // currentRightBound: index of the rightmost uncollected item in `itemLocations`
    // prevCollectedWasLeft: boolean, true if the last item collected was itemLocations[currentLeftBound - 1],
    //                       false if it was itemLocations[currentRightBound + 1].
    //                       This determines the robot's current position.
    function calculateSegmentCost(currentLeftBound, currentRightBound, prevCollectedWasLeft) {
        // Base case: If the left bound exceeds the right bound, all items in this segment have been collected.
        // No further travel is needed for this segment.
        if (currentLeftBound > currentRightBound) {
            return 0;
        }

        // Determine the memoization index based on the 'prevCollectedWasLeft' flag
        const memoIndex = prevCollectedWasLeft ? 0 : 1;

        // Check if this state has already been computed
        if (memoTable[currentLeftBound][currentRightBound][memoIndex] !== -1) {
            return memoTable[currentLeftBound][currentRightBound][memoIndex];
        }

        let currentRobotLocation;
        if (prevCollectedWasLeft) {
            // If the previous item collected was from the left side of the segment,
            // the robot is currently at `itemLocations[currentLeftBound - 1]`.
            // If `currentLeftBound` is 0, it means we are at the very beginning, so the robot is at 0.
            currentRobotLocation = (currentLeftBound === 0) ? 0 : itemLocations[currentLeftBound - 1];
        } else {
            // If the previous item collected was from the right side of the segment,
            // the robot is currently at `itemLocations[currentRightBound + 1]`.
            // If `currentRightBound` is `itemCount - 1`, it means we are at the very beginning, so the robot is at 0.
            currentRobotLocation = (currentRightBound === itemCount - 1) ? 0 : itemLocations[currentRightBound + 1];
        }

        let maximumPossibleGain = -Infinity; // Initialize with a very small value

        // Option 1: Pick the leftmost remaining item (`itemLocations[currentLeftBound]`)
        const targetLeftItem = itemLocations[currentLeftBound];
        const travelCostToLeft = getClockwiseDistance(currentRobotLocation, targetLeftItem, trackSize);
        const gainFromLeftPick = travelCostToLeft + calculateSegmentCost(currentLeftBound + 1, currentRightBound, true);
        maximumPossibleGain = Math.max(maximumPossibleGain, gainFromLeftPick);

        // Option 2: Pick the rightmost remaining item (`itemLocations[currentRightBound]`)
        const targetRightItem = itemLocations[currentRightBound];
        const travelCostToRight = getCounterClockwiseDistance(currentRobotLocation, targetRightItem, trackSize);
        const gainFromRightPick = travelCostToRight + calculateSegmentCost(currentLeftBound, currentRightBound - 1, false);
        maximumPossibleGain = Math.max(maximumPossibleGain, gainFromRightPick);

        // Store the computed maximum gain in the memoization table
        memoTable[currentLeftBound][currentRightBound][memoIndex] = maximumPossibleGain;
        return maximumPossibleGain;
    }

    // Initiate the DP calculation from the starting point (robot at 0, all items uncollected).
    // We consider two initial scenarios:
    // 1. The first item collected is conceptually "from the left side" of the full segment.
    // 2. The first item collected is conceptually "from the right side" of the full segment.
    // The `calculateSegmentCost` function correctly interprets the robot's starting position as 0
    // when `currentLeftBound` is 0 or `currentRightBound` is `itemCount - 1`.
    const maxPathFromLeftStart = calculateSegmentCost(0, itemCount - 1, true);
    const maxPathFromRightStart = calculateSegmentCost(0, itemCount - 1, false);

    // The final answer is the maximum of these two initial paths.
    console.log(Math.max(maxPathFromLeftStart, maxPathFromRightStart));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));