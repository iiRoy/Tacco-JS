const fileSystemBridge = require('fs');

// --- Configuration and Helper Definitions ---

// Standard input path for the environment
const standardInputSource = '/dev/stdin';

// Precision for outputting floating-point numbers
const displayPrecision = 5;

// Constant for converting degrees to radians
const RADIANS_PER_DEGREE = Math.PI / 180.0;

// Constant for common division by two
const HALF_QUANTIFIER = 0.5;

// Epsilon for floating point comparisons to handle near-zero values
const EPSILON_THRESHOLD = 1e-9;

/**
 * Safely reads content from a specified file path.
 * Exits the process on error or empty content.
 * @param {string} pathToFile The path to the input file.
 * @returns {string} The content of the file.
 */
function obtainInputContent(pathToFile) {
    try {
        const rawContentBuffer = fileSystemBridge.readFileSync(pathToFile, 'utf8');
        if (!rawContentBuffer || rawContentBuffer.trim().length === 0) {
            console.error("Fatal Error: Input stream provided no data or was empty.");
            process.exit(1);
        }
        return rawContentBuffer;
    } catch (readingError) {
        console.error(`Fatal Error: Could not access input at '${pathToFile}'. Reason: ${readingError.message}`);
        process.exit(1);
    }
}

/**
 * Parses a string into a floating-point number, with validation.
 * Exits the process if parsing fails.
 * @param {string} textValue The string to parse.
 * @returns {number} The parsed number.
 */
function parseAndValidateNumber(textValue) {
    const numericForm = parseFloat(textValue);
    if (isNaN(numericForm)) {
        console.error(`Fatal Error: Detected non-numeric input: '${textValue}'. All inputs must be valid numbers.`);
        process.exit(1);
    }
    return numericForm;
}

/**
 * Formats a number to a fixed decimal precision, handling potential non-numeric values.
 * @param {number} value The number to format.
 * @param {number} precision The number of decimal places.
 * @returns {string} The formatted string or "INVALID" if the input is not a valid number.
 */
function formatForOutput(value, precision) {
    if (isNaN(value) || !isFinite(value)) {
        return "INVALID"; // Indicate issues with calculation results
    }
    return value.toFixed(precision);
}

// --- Main Program Logic ---

// 1. Read raw data from the designated input source
const rawDataString = obtainInputContent(standardInputSource);

// 2. Process the raw data into an array of numbers
const processedNumericValues = rawDataString.split(' ').map(componentString => parseAndValidateNumber(componentString));

// 3. Validate the count of input values
const REQUIRED_VALUE_COUNT = 3;
if (processedNumericValues.length !== REQUIRED_VALUE_COUNT) {
    console.error(`Fatal Error: Expected ${REQUIRED_VALUE_COUNT} numeric inputs, but received ${processedNumericValues.length}.`);
    process.exit(1);
}

// 4. Assign and validate individual triangle parameters
const [sideLengthA, sideLengthB, angleInDegrees] = processedNumericValues;

// Basic geometric constraints validation
if (sideLengthA <= 0 || sideLengthB <= 0) {
    console.error("Fatal Error: Both side lengths must be strictly positive.");
    process.exit(1);
}
if (angleInDegrees <= 0 || angleInDegrees >= 180) { // Angle must be strictly between 0 and 180 for a non-degenerate triangle
    console.error("Fatal Error: The included angle must be greater than 0 and less than 180 degrees.");
    process.exit(1);
}

// --- Triangle Property Calculations ---

// Convert angle from degrees to radians for trigonometric functions
const angleInRadians = angleInDegrees * RADIANS_PER_DEGREE;

// Calculate sine and cosine of the angle once to reuse
const sineOfIncludedAngle = Math.sin(angleInRadians);
const cosineOfIncludedAngle = Math.cos(angleInRadians);

// Calculate the effective height relative to side 'A'
// This is equivalent to h = b * sin(C)
const calculatedHeight = sideLengthB * sineOfIncludedAngle;

// Calculate the triangle's area using the formula: Area = 0.5 * a * b * sin(C)
const triangleSurfaceArea = HALF_QUANTIFIER * sideLengthA * sideLengthB * sineOfIncludedAngle;

// Calculate the length of the third side using the Law of Cosines: c^2 = a^2 + b^2 - 2ab * cos(C)
const squareOfSideA = sideLengthA * sideLengthA; // Rewriting Math.pow(sideLengthA, 2)
const squareOfSideB = sideLengthB * sideLengthB; // Rewriting Math.pow(sideLengthB, 2)

const cosineTermComponent = 2 * sideLengthA * sideLengthB * cosineOfIncludedAngle;

let thirdSideSquaredValue = squareOfSideA + squareOfSideB - cosineTermComponent;

// Guard against potential negative results due to floating point inaccuracies for square root
if (thirdSideSquaredValue < 0 && Math.abs(thirdSideSquaredValue) < EPSILON_THRESHOLD) {
    // If very close to zero, treat as zero (e.g., for a degenerate line-like triangle)
    thirdSideSquaredValue = 0;
} else if (thirdSideSquaredValue < 0) {
    console.error("Fatal Error: Calculated square of the third side is negative, indicating invalid triangle geometry.");
    process.exit(1);
}

const thirdSideLength = Math.sqrt(thirdSideSquaredValue);

// Calculate the total perimeter
const totalPerimeter = sideLengthA + sideLengthB + thirdSideLength;

// --- Output Results ---

console.log(`Area of Triangle: ${formatForOutput(triangleSurfaceArea, displayPrecision)}`);
console.log(`Total Perimeter: ${formatForOutput(totalPerimeter, displayPrecision)}`);
console.log(`Height to Side A: ${formatForOutput(calculatedHeight, displayPrecision)}`);

// End marker
console.log("--- Geometrical Analysis Concluded ---");