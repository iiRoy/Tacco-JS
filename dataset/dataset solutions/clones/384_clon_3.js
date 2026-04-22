/*
 * This module is responsible for processing a series of numerical challenges.
 * It reads input from a designated system source, typically standard input,
 * where the first line indicates the total number of scenarios to evaluate.
 * Subsequent lines each contain two integer values: a beginning coordinate
 * and a desired destination coordinate.
 *
 * For every scenario, the system computes a unique sequence of steps
 * required to navigate from the beginning coordinate to the destination
 * coordinate, adhering to a specific set of rules:
 * 1. If the beginning coordinate is already the destination, the path
 *    consists only of the starting point.
 * 2. If the beginning coordinate is numerically less than the destination,
 *    the current coordinate is incremented by one at each step until the
 *    destination is reached.
 * 3. If the beginning coordinate is numerically greater than the destination
 *    AND the beginning coordinate is five or less, the current coordinate
 *    is decremented by one at each step until the destination is reached.
 * 4. In all other cases (i.e., beginning is greater than destination AND
 *    beginning is greater than five), the current coordinate is incremented
 *    by one. A special condition applies: if the current coordinate
 *    reaches ten, it is immediately reset back to five. This process
 *    continues until the destination is achieved.
 *
 * The generated sequence of coordinates for each challenge is then
 * presented to standard output, with individual coordinates separated
 * by a single space.
 */

// Acquire the necessary core module for file system operations.
const fileSystemUtility = require('fs');

// Define the absolute path from which input data will be fetched.
const standardInputPath = '/dev/stdin';

// Retrieve all raw text data from the specified input source, encoded as UTF-8.
let rawStreamData = fileSystemUtility.readFileSync(standardInputPath, 'utf8');

// Pre-process the raw data: remove any trailing whitespace (like newlines)
// and then segment the string into an array of individual lines.
// We also filter out any lines that might be empty after splitting.
let processedDataLines = rawStreamData.trimEnd().split('\n').filter(lineContent => lineContent.length > 0);

// Extract the total count of operational cases from the very first line of input.
// Ensure robust conversion to an integer.
const totalOperationCases = parseInt(processedDataLines.shift(), 10);

/**
 * Orchestrates the generation of a precise movement sequence between two points,
 * adhering to the established navigational protocols.
 *
 * @param {number} initialPoint - The starting numerical position for the movement.
 * @param {number} finalPoint - The target numerical position to be reached.
 * @returns {number[]} An ordered array detailing each point visited along the path.
 */
const calculateTraversalPath = (initialPoint, finalPoint) => {
    let currentWaypoint = initialPoint;
    // The path always commences with the initial point.
    const traversalHistory = [currentWaypoint];

    // Scenario 1: If start and end are identical, no movement is required.
    if (currentWaypoint === finalPoint) {
        return traversalHistory;
    }

    // Scenario 2: If the initial point is lower than the final point, increment.
    if (currentWaypoint < finalPoint) {
        while (currentWaypoint !== finalPoint) {
            currentWaypoint++;
            traversalHistory.push(currentWaypoint);
        }
    }
    // Scenario 3: If initial is higher than final AND initial is 5 or less, decrement.
    else if (currentWaypoint > finalPoint && currentWaypoint <= 5) {
        while (currentWaypoint !== finalPoint) {
            currentWaypoint--;
            traversalHistory.push(currentWaypoint);
        }
    }
    // Scenario 4: Otherwise (initial is higher than final AND initial is greater than 5),
    // apply special increment with a reset mechanism.
    else { // This implicitly means: currentWaypoint > finalPoint && currentWaypoint > 5
        while (currentWaypoint !== finalPoint) {
            currentWaypoint++;
            // Specific rule: if the waypoint reaches 10, it cycles back to 5.
            if (currentWaypoint === 10) {
                currentWaypoint = 5;
            }
            traversalHistory.push(currentWaypoint);
        }
    }
    return traversalHistory;
};

// Iterate through each defined operation case.
for (let caseIteratorIndex = 0; caseIteratorIndex < totalOperationCases; caseIteratorIndex++) {
    // Parse the current line to extract the start and end values for the movement.
    // Explicitly convert string parts to integers.
    const [startCoordinate, endCoordinate] = processedDataLines[caseIteratorIndex]
                                            .split(' ')
                                            .map(coordinateString => parseInt(coordinateString, 10));

    // Implement a basic validation check for parsed numerical inputs.
    // If input is invalid, log an error and proceed to the next case.
    if (isNaN(startCoordinate) || isNaN(endCoordinate)) {
        console.error(`Input error: Malformed data detected for scenario ${caseIteratorIndex + 1}. This case will be skipped.`);
        continue; // Skip the current iteration if data is not valid.
    }

    // Execute the path calculation function with the extracted coordinates.
    const generatedPath = calculateTraversalPath(startCoordinate, endCoordinate);

    // Present the final computed path to standard output, with elements
    // delimited by a single space character.
    console.log(generatedPath.join(' '));
}

// The script has completed its execution cycle.