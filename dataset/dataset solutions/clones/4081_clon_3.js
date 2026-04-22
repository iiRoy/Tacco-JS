// This module evaluates the feasibility of a series of travel segments.
// It determines if a journey described by a sequence of timed coordinates is possible
// given specific movement constraints:
// 1. Time must be sufficient to cover the Manhattan distance.
// 2. The remaining time after covering the Manhattan distance must be even,
//    as each unit of time allows moving one unit in any cardinal direction,
//    preserving the parity of (time - (x + y)).

/**
 * Parses a string representation of coordinates into an array of numbers.
 * @param {string} coordinateString - A space-separated string of numerical coordinates.
 * @returns {Array<number>} An array containing the parsed numerical coordinates.
 */
const parseCoordinateString = (coordinateString) => {
    // Split the string by spaces and convert each part to a number.
    // Ensure that only valid numbers are included.
    return coordinateString
        .split(' ')
        .map(token => Number(token.trim()))
        .filter(num => !isNaN(num));
};

/**
 * Determines if a set of travel segments can be completed according to specific rules.
 * Each segment specifies a target time (t), x-coordinate, and y-coordinate.
 *
 * @param {string} rawJourneyData - The raw input string containing journey details.
 *                                  The first line is usually a count, subsequent lines
 *                                  are 't x y' for each destination.
 * @returns {string} 'Yes' if the journey is possible, 'No' otherwise.
 */
function assessTripPossibility(rawJourneyData) {
    // Define constants for the possible outcomes to improve readability.
    const POSSIBLE_OUTCOME = 'Yes';
    const IMPOSSIBLE_OUTCOME = 'No';

    // Split the input data into individual lines.
    // Filter out any empty lines that might result from extra newlines.
    // Then, discard the first line which typically contains metadata (e.g., number of trips).
    const journeyRecordLines = rawJourneyData
                                .split('\n')
                                .filter(lineContent => lineContent.trim() !== '')
                                .slice(1);

    // If there are no actual journey records after parsing, it's trivially possible.
    if (journeyRecordLines.length === 0) {
        return POSSIBLE_OUTCOME;
    }

    // Convert string lines into structured numerical data (time, x, y coordinates).
    // Each element in 'scheduledStops' will be an array like [t, x, y].
    const scheduledStops = journeyRecordLines.map(parseCoordinateString);

    // Initialize the starting point and time.
    // The journey always begins at (t=0, x=0, y=0).
    let previousTimePoint = 0;
    let previousXCoordinate = 0;
    let previousYCoordinate = 0;

    // A flag to track if the entire journey remains feasible.
    let isJourneyViable = true;

    // Iterate through each scheduled stop (destination point).
    // We use a for...of loop for clear iteration over the array elements.
    for (const currentStop of scheduledStops) {
        // Ensure each stop record has the expected number of components (t, x, y).
        // This acts as a basic validation step.
        if (currentStop.length !== 3) {
            console.error(`Warning: Malformed stop record encountered: ${currentStop}. Skipping or failing.`);
            isJourneyViable = false; // Or handle as an error, depending on requirements.
            break;
        }

        // Destructure the current target time and coordinates for better readability.
        const [currentTimeTarget, currentXTarget, currentYTarget] = currentStop;

        // Calculate the time elapsed since the last known position.
        const timeElapsed = currentTimeTarget - previousTimePoint;

        // Calculate the absolute distance moved along the X-axis.
        const xDistanceDelta = Math.abs(currentXTarget - previousXCoordinate);
        // Calculate the absolute distance moved along the Y-axis.
        const yDistanceDelta = Math.abs(currentYTarget - previousYCoordinate);

        // The minimum time required to reach the target is the Manhattan distance.
        const minimumTimeRequired = xDistanceDelta + yDistanceDelta;

        // Condition 1: Check if enough time has passed to cover the Manhattan distance.
        // If timeElapsed is less than minimumTimeRequired, the destination is unreachable.
        if (timeElapsed < minimumTimeRequired) {
            isJourneyViable = false;
            break; // No need to check further stops if this one is impossible.
        }

        // Condition 2: Check the parity constraint.
        // The difference (timeElapsed - minimumTimeRequired) must be an even number.
        // This is because each unit of time allows a move of one unit,
        // which changes the sum of coordinates (x+y) by +/- 1.
        // Thus, (time - (x+y)) must always maintain the same parity.
        // Starting at (0,0,0), time - (x+y) = 0 (even).
        // Therefore, for any (t,x,y), t - (x+y) must be even.
        // This is equivalent to (timeElapsed - minimumTimeRequired) being even.
        const remainingTimeAfterTravel = timeElapsed - minimumTimeRequired;
        if (remainingTimeAfterTravel % 2 !== 0) {
            isJourneyViable = false;
            break; // Journey is impossible.
        }

        // If both conditions pass, update the current position and time
        // to the values of the current stop for the next iteration's calculations.
        previousTimePoint = currentTimeTarget;
        previousXCoordinate = currentXTarget;
        previousYCoordinate = currentYTarget;
    }

    // Return the final verdict based on the 'isJourneyViable' flag.
    return isJourneyViable ? POSSIBLE_OUTCOME : IMPOSSIBLE_OUTCOME;
}

// Read the input data from standard input.
// This part is environment-specific for competitive programming platforms.
const rawInputBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');

// Execute the main logic and print the result to standard output.
console.log(assessTripPossibility(rawInputBuffer));