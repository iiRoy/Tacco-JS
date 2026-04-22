'use strict';

// Constant for converting angles from degrees to radians.
const DEGREE_TO_RADIAN_FACTOR = Math.PI / 180.0;
// Constant for the half multiplier, commonly used in area calculations.
const HALF_COEFFICIENT = 0.5;

/**
 * Parses a whitespace-separated string of numbers into an array of numeric values.
 * Includes basic validation for the input string and individual numeric parsing.
 * @param {string} rawInputString - The string containing space-separated numbers.
 * @returns {Array<number>} An array of parsed numbers. Returns an empty array if input is invalid.
 */
function extractNumericParameters(rawInputString) {
    if (typeof rawInputString !== 'string' || rawInputString.trim() === '') {
        console.error("Error: Provided input string is either not a string or is empty.");
        return [];
    }

    const stringTokens = rawInputString.split(' ');
    const numericValues = stringTokens.map(token => {
        const parsedNumber = Number(token);
        if (isNaN(parsedNumber)) {
            console.warn(`Warning: Input token "${token}" could not be converted to a number. Setting to NaN.`);
        }
        return parsedNumber;
    });

    return numericValues;
}

/**
 * Transforms an angle value from degrees to its equivalent in radians.
 * @param {number} angleInDegrees - The angle measurement in degrees.
 * @returns {number} The corresponding angle measurement in radians.
 */
function convertAngleToRadians(angleInDegrees) {
    return angleInDegrees * DEGREE_TO_RADIAN_FACTOR;
}

/**
 * Computes the area, total perimeter, and height of a triangle given two sides and their included angle.
 * Applies the Law of Cosines for the third side and standard trigonometric formulas.
 * @param {number} sideLengthA - The length of the first side of the triangle.
 * @param {number} sideLengthB - The length of the second side of the triangle.
 * @param {number} includedAngleRadians - The angle between sideLengthA and sideLengthB, in radians.
 * @returns {object} An object containing 'area', 'perimeter', and 'height' properties. Returns NaNs if input is invalid.
 */
function calculateTriangleMeasurements(sideLengthA, sideLengthB, includedAngleRadians) {
    // Validate primary inputs for calculation.
    if (isNaN(sideLengthA) || isNaN(sideLengthB) || isNaN(includedAngleRadians) || sideLengthA <= 0 || sideLengthB <= 0) {
        console.error("Validation Error: Triangle side lengths must be positive numbers, and angle must be numeric.");
        return { area: NaN, perimeter: NaN, height: NaN };
    }

    // Determine the square of the third side using the Law of Cosines (c^2 = a^2 + b^2 - 2ab cos(C)).
    const termSquaredA = Math.pow(sideLengthA, 2);
    const termSquaredB = Math.pow(sideLengthB, 2);
    const cosineTerm = 2 * sideLengthA * sideLengthB * Math.cos(includedAngleRadians);
    const thirdSideSquared = termSquaredA + termSquaredB - cosineTerm;

    // Ensure the result under the square root is non-negative, otherwise it's not a valid triangle configuration.
    if (thirdSideSquared < 0) {
        console.error("Geometric Error: The given sides and angle do not form a valid triangle (negative value under square root for third side).");
        return { area: NaN, perimeter: NaN, height: NaN };
    }

    const thirdSideLength = Math.sqrt(thirdSideSquared);

    // Compute the triangle's perimeter by summing all three side lengths.
    const totalPerimeter = sideLengthA + sideLengthB + thirdSideLength;

    // Calculate the triangle's area using the formula (0.5 * a * b * sin(C)).
    const triangleArea = HALF_COEFFICIENT * sideLengthA * sideLengthB * Math.sin(includedAngleRadians);

    // Calculate the height corresponding to sideLengthA as the base (h = b * sin(C)).
    const heightRelativeToSideA = sideLengthB * Math.sin(includedAngleRadians);

    return {
        area: triangleArea,
        perimeter: totalPerimeter,
        height: heightRelativeToSideA
    };
}

/**
 * Sets up the standard input stream to collect data and then executes
 * a provided callback function with the complete collected input.
 * @param {function(string): void} dataProcessingCallback - The function to be called with the full input string.
 */
function initializeInputCollector(dataProcessingCallback) {
    let collectedDataBuffer = ''; // Buffer to store all incoming data chunks.
    const standardInputSource = process.stdin; // Reference to the standard input stream.

    standardInputSource.setEncoding('utf8'); // Configure stream to interpret input as UTF-8 characters.

    // Attach an event listener for 'data' events, appending each chunk to the buffer.
    standardInputSource.on('data', (dataChunk) => {
        collectedDataBuffer += dataChunk;
    });

    // Attach an event listener for the 'end' event, signifying no more input.
    // Trim any leading/trailing whitespace from the collected data before passing it.
    standardInputSource.on('end', () => {
        dataProcessingCallback(collectedDataBuffer.trim());
    });
}

// Main application execution flow begins here.
initializeInputCollector((fullInputString) => {
    const parsedParameters = extractNumericParameters(fullInputString);

    // Define the expected number of parameters for triangle calculation.
    const REQUIRED_PARAMETER_COUNT = 3;

    // Validate that the correct number of parameters were parsed.
    if (parsedParameters.length !== REQUIRED_PARAMETER_COUNT) {
        console.error(`Input Error: Expected ${REQUIRED_PARAMETER_COUNT} numeric values (side1, side2, angle_degrees) but received ${parsedParameters.length}.`);
        return; // Terminate execution if input format is incorrect.
    }

    // Destructure the parsed values into meaningful variables.
    const [firstSide, secondSide, angleValueInDegrees] = parsedParameters;

    // Convert the angle from degrees to the necessary radians for trigonometric functions.
    const angleValueInRadians = convertAngleToRadians(angleValueInDegrees);

    // Execute the core triangle calculation logic.
    const calculatedResults = calculateTriangleMeasurements(firstSide, secondSide, angleValueInRadians);

    // Output the computed area, perimeter, and height to the console.
    // This logs the properties directly, separated by spaces.
    console.log(calculatedResults.area, calculatedResults.perimeter, calculatedResults.height);
});