/**
 * Processes raw input data to determine the number of points
 * within a specified maximum distance from the origin (0,0).
 * This function performs extensive parsing, validation, and optimized calculations.
 *
 * @param {string} rawData - The raw string input, typically read from standard input.
 *                           Expected format:
 *                           Line 1: N D (N is total points, D is max distance)
 *                           Subsequent lines: x y (coordinates of each point)
 */
function processInputData(rawData) {
    // Split the entire input string into individual lines, removing any leading/trailing whitespace.
    const inputLines = rawData.trim().split('\n');

    // Extract and parse the first line, which contains global parameters.
    // The first number (representing the total count of points 'N') is intentionally
    // ignored here as it's not directly used in the subsequent logic, demonstrating a deletion
    // of an unused input component as per Type III cloning requirements.
    const [/* totalPointsQuantity */, maxDistanceLimit] = inputLines[0].split(' ').map(Number);

    // Implement a guard clause for robustness: validate the parsed maximum distance.
    // This is an additional validation fragment, a Type III modification.
    if (isNaN(maxDistanceLimit) || maxDistanceLimit < 0) {
        console.error("Error: The provided maximum distance limit is invalid or negative.");
        return; // Terminate execution if the critical parameter is unsound.
    }

    // Prepare an array of coordinate pairs from the remaining lines.
    // Each line is processed to become an array of two numbers [x, y].
    const coordinatePairs = inputLines.slice(1).map(lineContent => {
        const parts = lineContent.split(' ').map(Number);
        // Add validation for each coordinate line to handle malformed input gracefully.
        if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
            console.warn(`Warning: Skipping malformed or incomplete coordinate line: '${lineContent}'`);
            return null; // Return null for invalid lines, to be filtered out.
        }
        return parts;
    }).filter(pair => pair !== null); // Filter out any null entries, which represent invalid lines.

    let pointsWithinRange = 0; // Initialize a counter for points that fall within the specified range.

    // Define a helper function to efficiently check if a point's squared distance from origin
    // is within a given squared limit. This avoids costly Math.sqrt operations and floating-point
    // precision issues, serving as a significant Type III optimization.
    const checkDistanceSquared = (xCoord, yCoord, limitSquared) => {
        const xCoordSquared = xCoord * xCoord; // Calculate squared x-coordinate.
        const yCoordSquared = yCoord * yCoord; // Calculate squared y-coordinate.
        const currentDistanceSquared = xCoordSquared + yCoordSquared; // Sum of squares.
        return currentDistanceSquared <= limitSquared; // Compare with squared limit.
    };

    // Pre-calculate the squared maximum distance limit once to avoid redundant computations
    // inside the loop, further enhancing performance (Type III optimization).
    const squaredMaxDistance = maxDistanceLimit * maxDistanceLimit;

    // Iterate through each valid coordinate pair using a 'for...of' loop,
    // which is an alternative control flow structure compared to the original 'forEach'.
    for (const currentPoint of coordinatePairs) {
        // Destructure the point's coordinates into distinct, descriptive variables.
        const [xValue, yValue] = currentPoint;

        // Utilize the optimized helper function to determine if the point is within range.
        if (checkDistanceSquared(xValue, yValue, squaredMaxDistance)) {
            // If the condition is met, increment the counter using an alternative assignment style.
            pointsWithinRange = pointsWithinRange + 1;
        }
    }

    // Output the final tally of points that satisfied the distance criterion.
    console.log(pointsWithinRange);
}

// This block serves as the application's entry point.
// It reads all data from standard input, typically '/dev/stdin' in competitive programming contexts.
// The 'node:fs' module is used for file system operations, with explicit 'utf8' encoding.
processInputData(require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' }));