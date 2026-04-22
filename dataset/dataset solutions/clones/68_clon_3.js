// This script processes a series of movement commands provided via standard input.
// Each command specifies a distance and an angle increment, cumulatively
// determining a final Cartesian (x, y) position.

// Initialize the primary coordinate accumulators and the total rotational angle.
let finalXCoordinate = 0.0;    // Represents the accumulated horizontal displacement.
let finalYCoordinate = 0.0;    // Represents the accumulated vertical displacement.
let cumulativeRotationDegrees = 0.0; // Tracks the total angle turned in degrees.

// Define a conversion constant for translating degrees into radians,
// essential for trigonometric functions in JavaScript.
const DEGREE_TO_RADIAN_CONVERSION_FACTOR = Math.PI / 180.0;

/**
 * A utility function to parse a string into a floating-point number.
 * If the string cannot be parsed into a valid number, it defaults to 0.0.
 * @param {string} inputString - The string to be parsed.
 * @returns {number} The parsed number or 0.0 if parsing fails.
 */
const retrieveNumericValue = (inputString) => {
    const numericalResult = parseFloat(inputString);
    // Return 0.0 for non-numeric or empty string inputs, ensuring robustness.
    return isNaN(numericalResult) ? 0.0 : numericalResult;
};

// Access the Node.js 'fs' module to read synchronous file data.
// Read the entire content of standard input (`/dev/stdin`), decode it as UTF-8.
const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

// Clean the input: remove leading/trailing whitespace and then split
// the content into an array of individual lines.
const individualInstructionLines = rawInputContent.trim().split('\n');

// Iterate through each instruction line. The 'some' method is used here,
// but its return value is consistently `false` to ensure all lines are processed,
// mimicking a simple forEach loop while retaining the original's control flow structure.
individualInstructionLines.some((currentLineOfInput) => {
    // Perform an initial check to skip any entirely empty or whitespace-only lines.
    if (!currentLineOfInput.trim()) {
        return false; // Continue to the next line.
    }

    // Break down the current line into its constituent parts using a comma as a delimiter.
    const lineSegments = currentLineOfInput.split(',');

    // Validate that the line contains at least two expected numerical components
    // (distance and angle increment).
    if (lineSegments.length < 2) {
        // Malformed line, skip processing this specific instruction.
        return false; // Continue to the next line.
    }

    // Extract and parse the distance and angle values from the line segments.
    // Utilizing the helper function for robust number conversion.
    const movementDistance = retrieveNumericValue(lineSegments[0]);
    const angularIncrease = retrieveNumericValue(lineSegments[1]);

    // Apply the movement only if both the distance and the angle increment
    // are meaningful (non-zero). This ensures that only valid steps contribute.
    if (movementDistance !== 0.0 && angularIncrease !== 0.0) {
        // Calculate the current heading in radians from the accumulated degrees.
        const currentHeadingInRadians = cumulativeRotationDegrees * DEGREE_TO_RADIAN_CONVERSION_FACTOR;

        // Determine the incremental change in X and Y coordinates.
        // Note: The original code uses Math.sin for X and Math.cos for Y,
        // which implies a coordinate system where 0 degrees is along the +Y axis.
        const deltaXContribution = movementDistance * Math.sin(currentHeadingInRadians);
        const deltaYContribution = movementDistance * Math.cos(currentHeadingInRadians);

        // Update the overall accumulated position.
        finalXCoordinate += deltaXContribution;
        finalYCoordinate += deltaYContribution;
    }

    // Always update the cumulative angle, regardless of whether a movement occurred.
    // This ensures the next step's angle is correctly calculated relative to the previous.
    cumulativeRotationDegrees += angularIncrease;

    return false; // Ensure the 'some' loop continues processing all instructions.
});

// Output the final accumulated X and Y coordinates.
// Math.trunc() is used to convert the floating-point results to integers
// by discarding any fractional part, consistent with the original's bitwise truncation.
console.log(Math.trunc(finalXCoordinate));
console.log(Math.trunc(finalYCoordinate));