// This module processes a sequence of movement instructions to determine overall feasibility.
// It reads a series of coordinate-time entries and validates if each step is possible
// based on specific distance and parity rules.

/**
 * Ascertains if two numeric values share the same parity (both even or both odd).
 * @param {number} valueOne The first numeric operand.
 * @param {number} valueTwo The second numeric operand.
 * @returns {boolean} True if both values have the same parity, false otherwise.
 */
const checkParityMatch = (valueOne, valueTwo) => {
    // The modulo operator returns the remainder of a division.
    // If remainders when divided by 2 are equal, parities match.
    return (valueOne % 2 === valueTwo % 2);
};

/**
 * Parses a single line of input representing a point in time and 2D space.
 * @param {string} singleRecordLine A string formatted as "time x y".
 * @returns {object} An object containing the parsed time, x-coordinate, and y-coordinate.
 */
const extractCoordinates = (singleRecordLine) => {
    // Split the input string by spaces to get individual components.
    const recordParts = singleRecordLine.split(" ");
    // Convert string components to base-10 integers.
    const parsedTime = parseInt(recordParts[0], 10);
    const parsedX = parseInt(recordParts[1], 10);
    const parsedY = parseInt(recordParts[2], 10);
    // Return an object for improved data structure and readability.
    return { time: parsedTime, x: parsedX, y: parsedY };
};

/**
 * The primary function for processing the full dataset of coordinate movements.
 * It determines if all specified transitions between points are valid.
 * @param {string} rawData The complete input string, typically from standard input.
 */
function ProcessCoordinates(rawData) {
    // Split the entire raw input into an array of individual lines.
    const linesOfData = rawData.split("\n");

    // The very first line of the input specifies the total number of coordinate entries (N).
    // Original code had a bug here trying to parse the entire array.
    const coordinateCount = parseInt(linesOfData[0], 10);

    // Extract the actual coordinate records, skipping the first line which only contains N.
    // The slice method fetches N records starting from the second line (index 1).
    const coordinateRecords = linesOfData.slice(1, coordinateCount + 1);

    // Initialize a boolean flag to track the overall feasibility of the path.
    // We assume the path is feasible until a rule violation is encountered.
    let isFeasiblePath = true;

    // Handle edge cases: if there are 0 or 1 coordinate points, no movement transitions exist.
    // In such scenarios, the path is considered trivially feasible.
    if (coordinateCount <= 1) {
        isFeasiblePath = true; // No transitions to validate.
    } else {
        // Iterate through the coordinate records, comparing each point with its immediate successor.
        // The loop runs 'coordinateCount - 1' times to check all adjacent pairs.
        for (let idx = 0; idx < coordinateCount - 1; ++idx) {
            // Retrieve and parse data for the current point (let's call it Point A).
            const pointInfoA = extractCoordinates(coordinateRecords[idx]);
            const timeA = pointInfoA.time;
            const coordXA = pointInfoA.x;
            const coordYA = pointInfoA.y;

            // Retrieve and parse data for the next point in the sequence (Point B).
            const pointInfoB = extractCoordinates(coordinateRecords[idx + 1]);
            const timeB = pointInfoB.time;
            const coordXB = pointInfoB.x;
            const coordYB = pointInfoB.y;

            // Calculate the time difference available for the transition from A to B.
            const timeDiff = timeB - timeA;

            // Calculate the specific "distance" metric as defined by the problem:
            // This is the absolute difference of the sum of coordinates.
            const manhattanSumDistance = Math.abs((coordXB + coordYB) - (coordXA + coordYA));

            // Evaluate the two primary conditions for a valid transition:
            // 1. Is the target point reachable within the allotted time?
            const isReachableByDistance = manhattanSumDistance <= timeDiff;
            // 2. Do the "distance" and time difference share the same parity?
            const hasCorrectParity = checkParityMatch(manhattanSumDistance, timeDiff);

            // If either of the conditions for a valid step is not met, the entire path is impossible.
            if (!isReachableByDistance || !hasCorrectParity) {
                isFeasiblePath = false; // Mark the path as not feasible.
                break; // Terminate the loop early as further checks are unnecessary.
            }
        }
    }

    // Based on the final state of the feasibility flag, construct the output message.
    const outcomeMessage = isFeasiblePath ? "YES" : "NO";

    // Print the determined outcome to the standard output.
    console.log(outcomeMessage);
}

// This final block is responsible for reading input from the standard input stream
// and invoking the main processing function with the collected data.
// It ensures compatibility with typical competitive programming environments.
ProcessCoordinates(require("fs").readFileSync("/dev/stdin", "utf8"));