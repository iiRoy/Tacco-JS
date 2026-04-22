function displayOutputMessage(messageContent) {
    console.log(messageContent);
}

/**
 * Calculates the total "travel cost" for a sequence of coordinate points,
 * and then computes the adjusted cost if each point were individually skipped.
 * The path starts at 0, visits points P1, P2, ..., Pn in order, and returns to 0.
 *
 * @param {string} rawInputData - The raw string input, typically from standard input.
 *                                Expected format:
 *                                Line 1: An integer representing the number of points (N).
 *                                Line 2: N space-separated integers representing the coordinate values.
 */
function ProcessCoordinateSequence(rawInputData) {
    // A constant representing the starting and ending point for the journey.
    const referenceOrigin = 0;

    // Helper arrow function to compute the absolute distance between two points.
    const calculateSegmentDistance = (point1, point2) => Math.abs(point1 - point2);

    // --- Input Parsing and Initial Validation ---
    // Clean up any extraneous whitespace from the beginning/end of the entire input.
    const trimmedInput = rawInputData.trim();

    // Split the input string into an array of lines.
    const inputLines = trimmedInput.split('\n');

    // Essential validation: Check if we have at least two lines of input.
    // The first line for the count, the second for the coordinates.
    if (inputLines.length < 2) {
        displayOutputMessage("Error: Insufficient input data. Expected at least two lines.");
        return;
    }

    // Parse the expected number of elements from the first line.
    // Using parseInt with radix 10 for explicit base.
    let expectedElementCount = parseInt(inputLines[0], 10);

    // Parse the sequence of coordinate points from the second line.
    // It splits by space, filters out any resulting empty strings (e.g., from multiple spaces),
    // and then converts each string segment into a numerical value.
    const coordinatePoints = inputLines[1].split(' ')
                                          .filter(segment => segment !== '')
                                          .map(segment => Number(segment));

    // Runtime validation: Compare the parsed count with the actual number of elements found.
    // If they differ, log a warning and adjust the count to match the actual data.
    if (coordinatePoints.length !== expectedElementCount) {
        displayOutputMessage(`Warning: Declared element count (${expectedElementCount}) does not match actual count (${coordinatePoints.length}). Proceeding with actual count.`);
        expectedElementCount = coordinatePoints.length; // Adjust for consistency.
    }

    // --- Handle Edge Cases for Small Input Sets ---
    // If there are no points, the total travel cost is zero.
    if (expectedElementCount === 0) {
        displayOutputMessage(0);
        return;
    }

    // If there's only one point, the path is 0 -> P1 -> 0.
    // The cost is |0 - P1| + |P1 - 0| = 2 * |P1|.
    // If P1 is skipped, the path becomes 0 -> 0, and the cost is 0.
    if (expectedElementCount === 1) {
        displayOutputMessage(0); // The result when the only point is skipped.
        return;
    }

    // --- Calculate the Initial Total Accumulated Distance ---
    // This represents the sum of distances for the full path:
    // referenceOrigin -> P_0 -> P_1 -> ... -> P_n-1 -> referenceOrigin
    let accumulatedTotalDistance = 0;

    // Add the distance from the origin to the very first point.
    accumulatedTotalDistance += calculateSegmentDistance(referenceOrigin, coordinatePoints[0]);

    // Iterate through the points to add distances between consecutive points.
    for (let currentPointIdx = 0; currentPointIdx < expectedElementCount - 1; ++currentPointIdx) {
        accumulatedTotalDistance += calculateSegmentDistance(coordinatePoints[currentPointIdx], coordinatePoints[currentPointIdx + 1]);
    }

    // Add the distance from the last point back to the origin.
    accumulatedTotalDistance += calculateSegmentDistance(coordinatePoints[expectedElementCount - 1], referenceOrigin);


    // --- Calculate Modified Distances for Each Skipped Point ---
    // For each point in the sequence, simulate its removal and calculate the new total path cost.
    for (let skipPointIdx = 0; skipPointIdx < expectedElementCount; ++skipPointIdx) {
        // Determine the point immediately preceding the one being skipped.
        // If skipping the first point (index 0), its conceptual predecessor is the origin.
        const pointBeforeSkipped = (skipPointIdx === 0) ? referenceOrigin : coordinatePoints[skipPointIdx - 1];

        // The value of the point currently being considered for skipping.
        const pointBeingSkipped = coordinatePoints[skipPointIdx];

        // Determine the point immediately succeeding the one being skipped.
        // If skipping the last point (index N-1), its conceptual successor is the origin.
        const pointAfterSkipped = (skipPointIdx === expectedElementCount - 1) ? referenceOrigin : coordinatePoints[skipPointIdx + 1];

        // When `pointBeingSkipped` is removed, two segments are eliminated from the original path:
        // 1. From `pointBeforeSkipped` to `pointBeingSkipped`
        // 2. From `pointBeingSkipped` to `pointAfterSkipped`
        const eliminatedSegmentCost = calculateSegmentDistance(pointBeforeSkipped, pointBeingSkipped) +
                                      calculateSegmentDistance(pointBeingSkipped, pointAfterSkipped);

        // A new direct segment is introduced to bridge the gap:
        // 1. From `pointBeforeSkipped` directly to `pointAfterSkipped`
        const introducedSegmentCost = calculateSegmentDistance(pointBeforeSkipped, pointAfterSkipped);

        // The modified total cost is the original total minus the eliminated segments, plus the new segment.
        const adjustedPathCost = accumulatedTotalDistance - eliminatedSegmentCost + introducedSegmentCost;

        // Output the calculated adjusted cost for the current point being skipped.
        displayOutputMessage(adjustedPathCost);
    }
}

// Entry point for execution: Reads input from standard input and passes it to the main processing function.
ProcessCoordinateSequence(require("fs").readFileSync("/dev/stdin", "utf8"));