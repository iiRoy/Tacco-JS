/**
 * Processes raw input data to calculate a minimized segment sum.
 * This function interprets the input to solve a problem where a set of M points
 * are given on a line. The objective is to determine the minimum possible sum
 * of lengths of (M - N) smallest gaps between these points.
 *
 * The input specifies 'N' (target segment count or a parameter influencing cuts)
 * and 'M' (total number of points). The logic effectively identifies the
 * M - N smallest differences between adjacent points after sorting.
 *
 * @param {string} rawInputData - The entire input as a single string, typically read from standard input.
 */
function processInputData(rawInputData) {
    // Step 1: Parse the incoming raw data string into logical components.
    // The input is expected to have two lines:
    // Line 1: Two integers, 'N' (target segment count) and 'M' (total points), space-separated.
    // Line 2: 'M' integers representing the positions of the points, space-separated.
    const inputLineFragments = rawInputData.trim().split('\n');

    // Helper function to convert a space-separated string of numbers into an array of actual numbers.
    const convertLineToNumbers = (lineString) => lineString.split(/\s+/).map(Number);

    // Extract 'N' and 'M' from the first line.
    // N is `targetSegmentCount`, M is `totalPointCount`.
    const [targetSegmentCount, totalPointCount] = convertLineToNumbers(inputLineFragments[0]);

    // Extract the point positions from the second line.
    let pointCoordinates = convertLineToNumbers(inputLineFragments[1]);

    // Step 2: Sort the point coordinates to ensure differences between adjacent points are meaningful.
    // This is a fundamental step for calculating segment lengths.
    pointCoordinates.sort((coordA, coordB) => coordA - coordB);

    // Step 3: Handle an edge case where the target segment count is too high.
    // If the number of points (M) is less than or equal to the target segment count (N),
    // it implies that we can effectively make enough cuts to separate all points,
    // resulting in no remaining "segment" cost. The sum of the smallest gaps becomes zero.
    if (totalPointCount <= targetSegmentCount) {
        console.log(0);
        return; // Terminate execution early for this scenario.
    }

    // Step 4: Calculate the lengths of all possible gaps between adjacent points.
    // For M points, there are M-1 gaps.
    const distanceBetweenAdjacentPoints = [];
    for (let currentPointIndex = 0; currentPointIndex < totalPointCount - 1; currentPointIndex++) {
        // Since pointCoordinates is sorted, pointCoordinates[currentPointIndex + 1] will always be >= currentPointIndex.
        // Thus, Math.abs is not strictly necessary here, as the difference will always be non-negative.
        const gapValue = pointCoordinates[currentPointIndex + 1] - pointCoordinates[currentPointIndex];
        distanceBetweenAdjacentPoints.push(gapValue);
    }

    // Step 5: Identify and sum the required number of smallest gaps.
    // The problem's objective, based on the original code's behavior, is to sum the
    // (totalPointCount - targetSegmentCount) smallest gaps.
    // To achieve this efficiently, we sort the gap lengths in ascending order.
    distanceBetweenAdjacentPoints.sort((gapA, gapB) => gapA - gapB);

    // Determine exactly how many of the smallest gaps we need to sum.
    const countOfGapsToIncludeInSum = totalPointCount - targetSegmentCount;

    let cumulativeMinimumSum = 0;
    // Iterate through the sorted gaps and accumulate the sum of the smallest ones.
    for (let loopIndex = 0; loopIndex < countOfGapsToIncludeInSum; loopIndex++) {
        cumulativeMinimumSum += distanceBetweenAdjacentPoints[loopIndex];
    }

    // Step 6: Output the final calculated minimum sum.
    console.log(cumulativeMinimumSum);
}

// Main execution entry point: Reads input from standard input and passes it to the processing function.
// This assumes a Node.js environment where 'fs' module is available to read '/dev/stdin'.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));