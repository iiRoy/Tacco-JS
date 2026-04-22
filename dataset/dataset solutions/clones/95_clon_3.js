const fileSystem = require('fs');

// Define a constant for the standard input path to make it easily configurable.
const STANDARD_INPUT_SOURCE = '/dev/stdin';

/**
 * Utility function to read raw input from a specified file path,
 * clean it up by removing a trailing newline if present, and then
 * split the content into an array of individual lines.
 *
 * @param {string} sourcePath - The file path to read input from.
 * @returns {string[]} An array where each element is a line from the input.
 */
const retrieveAndProcessInputLines = (sourcePath) => {
    // Read the entire file content synchronously as a UTF-8 string.
    const rawContentBuffer = fileSystem.readFileSync(sourcePath, 'utf8');

    // Check if the content ends with a newline and remove it.
    // This prevents an empty string element in the array after splitting
    // if the input file ends with a newline.
    const trimmedContent = rawContentBuffer.endsWith('\n')
        ? rawContentBuffer.slice(0, -1)
        : rawContentBuffer;

    // Split the cleaned content into an array of lines.
    return trimmedContent.split('\n');
};

// Acquire and preprocess all input lines from the standard input.
let processedInputLines = retrieveAndProcessInputLines(STANDARD_INPUT_SOURCE);

// The very first line of the input specifies the total count of test scenarios
// that follow. We extract it and convert it to a number using the unary plus operator.
const totalTestScenarios = +processedInputLines.shift();

/**
 * Helper function to parse a string containing space-separated numbers
 * into an array of numeric values.
 *
 * @param {string} numericString - A string like "10 20 5".
 * @returns {number[]} An array of numbers, e.g., [10, 20, 5].
 */
const parseNumericValuesFromLine = (numericString) =>
    numericString.split(' ').map(Number);

// Iterate through each test scenario specified by totalTestScenarios.
for (let currentScenarioIndex = 0;
     currentScenarioIndex < totalTestScenarios;
     ++currentScenarioIndex) {

    // For each scenario, the next line contains six parameters for two circles:
    // (center X, center Y, radius) for Circle A, followed by the same for Circle B.
    // We use array destructuring to assign these values directly.
    const [
        circleAXCoord, circleAYCoord, circleARadius,
        circleBXCoord, circleBYCoord, circleBRadius
    ] = parseNumericValuesFromLine(processedInputLines.shift());

    // Calculate the difference in X coordinates between the two circle centers.
    const xDistanceDelta = circleBXCoord - circleAXCoord;
    // Square the X coordinate difference.
    const xDistanceDeltaSquared = xDistanceDelta * xDistanceDelta;

    // Calculate the difference in Y coordinates between the two circle centers.
    const yDistanceDelta = circleBYCoord - circleAYCoord;
    // Square the Y coordinate difference.
    const yDistanceDeltaSquared = yDistanceDelta * yDistanceDelta;

    // Compute the Euclidean distance between the centers of the two circles.
    // This is done using the Pythagorean theorem (sqrt(dx^2 + dy^2)).
    const centralDistance = Math.sqrt(xDistanceDeltaSquared + yDistanceDeltaSquared);

    // Calculate the sum of the radii of the two circles.
    const combinedRadiiSum = circleARadius + circleBRadius;

    // Calculate the absolute difference between the radii.
    // This value is critical for determining if one circle is contained within another.
    const absoluteRadiiDifference = Math.abs(circleARadius - circleBRadius);

    let scenarioOutcome; // Variable to store the classification result for the current pair of circles.

    // Logic to classify the spatial relationship between the two circles.

    // Scenario 0: Circles are completely separate and do not touch.
    // This occurs if the distance between their centers is strictly greater than the sum of their radii.
    if (centralDistance > combinedRadiiSum) {
        scenarioOutcome = 0;
    }
    // Scenario -2 or 2: One circle is entirely contained within the other (potentially touching internally).
    // This happens if the distance between centers is strictly less than the absolute difference of their radii.
    else if (centralDistance < absoluteRadiiDifference) {
        // If Circle A's radius is larger, then Circle B must be inside Circle A.
        if (circleARadius > circleBRadius) {
            scenarioOutcome = 2; // Circle B is contained within Circle A.
        }
        // Otherwise (if Circle B's radius is larger or equal), Circle A is inside Circle B.
        // Note: If radii are equal and distance is 0, they are identical, which falls through to '1'
        // in the original logic as 'd < |ra-rb|' would be '0 < 0' (false).
        // Here, if radii are equal, absoluteRadiiDifference is 0, so 'centralDistance < 0' is false.
        // So, identical circles will correctly fall into the 'else' block below, yielding 1.
        else {
            scenarioOutcome = -2; // Circle A is contained within Circle B.
        }
    }
    // Scenario 1: Circles intersect at two points, or touch externally/internally.
    // This is the default case if none of the above strict conditions for separation or full containment are met.
    // It covers:
    // - External tangency: centralDistance === combinedRadiiSum
    // - Internal tangency: centralDistance === absoluteRadiiDifference
    // - Two intersection points: absoluteRadiiDifference < centralDistance < combinedRadiiSum
    else {
        scenarioOutcome = 1;
    }

    // Output the calculated relationship code for the current scenario.
    console.log(scenarioOutcome);
}