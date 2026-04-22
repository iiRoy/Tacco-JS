const fsUtility = require('fs'); // Alias for the file system module.

// --- Configuration and Input Acquisition ---

// Defines the path for standard input, typically used in competitive programming environments.
const stdInputFilePath = '/dev/stdin';

// Reads the entire content of the standard input file as a UTF-8 encoded string.
// This string is expected to contain coordinate data.
let rawDataString = fsUtility.readFileSync(stdInputFilePath, 'utf8');

// --- Input Parsing and Validation ---

// Trims any leading or trailing whitespace from the raw input string.
// Then, splits the cleaned string into an array of substrings using space as a delimiter.
const coordinateTokens = rawDataString.trim().split(' ');

// A simple validation check to ensure the correct number of coordinate components.
// We expect four components: x1, y1, x2, y2.
if (coordinateTokens.length !== 4) {
    console.error('Error: Insufficient or excessive coordinate values provided. Expected four numeric values (x1 y1 x2 y2).');
    process.exit(1); // Exit the process with an error code.
}

// A helper function to safely convert a string to a number and perform basic validation.
const convertToValidNumber = (valueString, componentIndex) => {
    const numericalValue = Number(valueString);
    // Checks if the conversion resulted in a Not-a-Number value.
    if (isNaN(numericalValue)) {
        console.error(`Error: Invalid non-numeric input detected at component ${componentIndex + 1}: "${valueString}"`);
        process.exit(1);
    }
    return numericalValue;
};

// Initializes an array to hold the parsed numeric coordinates.
const parsedNumericCoords = [];

// Iterates through the string tokens, converts each to a number, and validates it.
for (let i = 0; i < coordinateTokens.length; i++) {
    parsedNumericCoords.push(convertToValidNumber(coordinateTokens[i], i));
}

// Destructures the array into distinct variables for clarity, representing two points.
const [pointOneX, pointOneY, pointTwoX, pointTwoY] = parsedNumericCoords;

// --- Euclidean Distance Calculation ---

// Calculates the difference along the x-axis.
const deltaXComponent = pointTwoX - pointOneX;

// Calculates the difference along the y-axis.
const deltaYComponent = pointTwoY - pointOneY;

// A utility function to compute the square of a number.
// This is a direct multiplication, equivalent to Math.pow(val, 2).
const computeSquare = (value) => value * value;

// Squares the x-component difference.
const squaredDeltaX = computeSquare(deltaXComponent);

// Squares the y-component difference.
const squaredDeltaY = computeSquare(deltaYComponent);

// Sums the squared differences, which is the value under the square root in the distance formula.
const sumOfSquaredComponents = squaredDeltaX + squaredDeltaY;

// Computes the final Euclidean distance by taking the square root of the sum.
const finalEuclideanDistance = Math.sqrt(sumOfSquaredComponents);

// --- Output Formatting ---

// Specifies the desired number of decimal places for the output.
const desiredDecimalPrecision = 8;

// Formats the calculated distance to the specified precision.
const formattedOutputString = finalEuclideanDistance.toFixed(desiredDecimalPrecision);

// --- Display Result ---

// Prints the formatted distance to the standard output.
console.log(formattedOutputString);