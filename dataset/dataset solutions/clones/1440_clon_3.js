const fileSystem = require('fs');

const STANDARD_INPUT_PATH = '/dev/stdin';

/**
 * A helper function to safely parse a string into a numeric value.
 * It trims whitespace and performs an explicit number conversion.
 * @param {string} strValue - The string to be parsed.
 * @returns {number} The parsed numeric value, or NaN if parsing fails.
 */
const parseNumericValue = (strValue) => {
    // Remove leading/trailing whitespace to handle varied input formats.
    const trimmedValue = strValue.trim();
    // Use the Number constructor for explicit type conversion.
    return Number(trimmedValue);
};

// --- Phase 1: Input Acquisition ---
// This block is responsible for reading the raw data provided via standard input.
let initialInputString = '';
try {
    // Read the entire content of the standard input file as a UTF-8 encoded string.
    initialInputString = fileSystem.readFileSync(STANDARD_INPUT_PATH, 'utf8');
} catch (inputReadError) {
    // In a production environment, more sophisticated error handling would be implemented.
    // For competitive programming, /dev/stdin is generally guaranteed to exist.
    console.error(`ERROR: Failed to read input from ${STANDARD_INPUT_PATH}. Details:`, inputReadError.message);
    // Terminate the process if input cannot be obtained, as it's critical.
    process.exit(1);
}


// --- Phase 2: Data Preprocessing and Transformation ---
// The raw input string needs to be broken down into individual numeric components.
// First, split the string by spaces. The filter step ensures that any empty strings
// resulting from multiple consecutive spaces are removed, enhancing robustness.
const rawCoordinateStrings = initialInputString.split(' ').filter(segment => segment !== '');

// Then, map each string segment to its corresponding numeric representation using our helper.
const parsedNumericCoordinates = rawCoordinateStrings.map(parseNumericValue);

// Define the expected count of coordinates for basic input validation.
const REQUIRED_COORDINATE_COUNT = 4;

// Perform a basic validation check on the number of parsed coordinates.
// If the input is malformed, a warning is logged, but processing continues
// to allow for partial results or further error handling downstream.
if (parsedNumericCoordinates.length < REQUIRED_COORDINATE_COUNT) {
    console.warn(
        `WARNING: Expected at least ${REQUIRED_COORDINATE_COUNT} numeric coordinates, ` +
        `but only received ${parsedNumericCoordinates.length}. ` +
        `This might lead to 'NaN' results or incorrect calculations.`
    );
}

// --- Phase 3: Coordinate Extraction and Assignment ---
// Assign the parsed numeric values to clearly named variables representing
// the individual X and Y components of two distinct points (P1 and P2).
const pointOneX = parsedNumericCoordinates[0]; // The X-coordinate of the first point.
const pointOneY = parsedNumericCoordinates[1]; // The Y-coordinate of the first point.
const pointTwoX = parsedNumericCoordinates[2]; // The X-coordinate of the second point.
const pointTwoY = parsedNumericCoordinates[3]; // The Y-coordinate of the second point.

// --- Phase 4: Euclidean Distance Calculation ---
// Calculate the difference along the X-axis between the two points.
const deltaX = pointOneX - pointTwoX;
// Calculate the difference along the Y-axis between the two points.
const deltaY = pointOneY - pointTwoY;

// Square the differences. Using direct multiplication is an alternative to Math.pow().
const deltaX_squared = deltaX * deltaX; // Represents (x1 - x2)^2
const deltaY_squared = deltaY * deltaY; // Represents (y1 - y2)^2

// Sum the squared differences to get the squared Euclidean distance.
// This is a direct application of the Pythagorean theorem (a^2 + b^2 = c^2).
const cumulativeSquaredDistance = deltaX_squared + deltaY_squared;

// Calculate the final Euclidean distance by taking the square root of the sum.
const finalEuclideanDistance = Math.sqrt(cumulativeSquaredDistance);

// --- Phase 5: Result Validation and Output ---
// Check if the final calculated distance is a valid number. This catches cases
// where input parsing might have resulted in 'NaN' values propagating through calculations.
if (isNaN(finalEuclideanDistance)) {
    console.error("ERROR: The computed distance is 'Not a Number'. Please verify the input data for validity.");
    process.exit(1);
}

// Format the calculated distance to precisely five decimal places.
// The `toFixed()` method returns a string representation.
const formattedDistanceOutput = finalEuclideanDistance.toFixed(5);

// Display the final, formatted Euclidean distance to the standard output.
console.log(formattedDistanceOutput);