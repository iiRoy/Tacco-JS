const fileSystemModule = require("fs"); // Load the file system module

let rawInputData; // Variable to hold the raw content read from standard input

// Attempt to read all input from /dev/stdin
try {
    rawInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");

    // Validate if the input data is not empty or just whitespace
    if (!rawInputData || rawInputData.trim().length === 0) {
        console.error("Error: Standard input data is empty or contains only whitespace.");
        process.exit(1); // Exit with an error code
    }
} catch (readError) {
    // Catch and report any errors during file reading
    console.error("Failed to read input from /dev/stdin:", readError.message);
    process.exit(1); // Exit with an error code
}

// Split the raw input into individual tokens based on spaces or newlines
// Multiple delimiters are handled by the regex `[\s\n]+`
let tokenCollection = rawInputData.split(/[\s\n]+/);
let currentTokenPointer = 0; // Pointer to the current token being processed

/**
 * Retrieves the next available token from the parsed input collection.
 * Includes robust error handling for out-of-bounds access.
 * @returns {string} The next token.
 */
const retrieveNextToken = () => {
    // Check if the pointer has exceeded the bounds of the token array
    if (currentTokenPointer >= tokenCollection.length) {
        console.error("Error: Ran out of tokens in the input stream.");
        process.exit(1); // Terminate execution due to insufficient input
    }
    // Return the current token and advance the pointer
    return tokenCollection[currentTokenPointer++];
};

/**
 * Obtains a specified number of tokens from the input stream and parses them as integers.
 * Includes validation for token count and successful integer parsing.
 * @param {number} count The number of numeric tokens to retrieve.
 * @returns {number[]} An array containing the parsed integer values.
 */
const obtainNumericTokens = (count) => {
    // Ensure that a valid positive count is requested
    if (count <= 0) {
        console.error("Error: The requested number of tokens must be a positive integer.");
        process.exit(1);
    }

    const extractedNumericValues = []; // Array to store the parsed numbers

    // Loop to retrieve and parse each required token
    for (let i = 0; i < count; i++) {
        const currentRawToken = retrieveNextToken(); // Get the next raw token
        const parsedIntegerValue = parseInt(currentRawToken, 10); // Attempt to parse as base-10 integer

        // Validate if the parsing was successful
        if (isNaN(parsedIntegerValue)) {
            console.error(`Error: Expected a numeric value but received '${currentRawToken}'`);
            process.exit(1); // Exit if a non-numeric token is found
        }
        extractedNumericValues.push(parsedIntegerValue); // Add the parsed integer to the result array
    }
    return extractedNumericValues;
};

// Extract the four required input values: two arm lengths, current hour, and current minute
const [firstArmLength, secondArmLength, currentClockHour, currentClockMinute] = obtainNumericTokens(4);

// Perform basic validation on the extracted input values
if (firstArmLength < 0 || secondArmLength < 0) {
    console.error("Error: Arm lengths cannot be negative.");
    process.exit(1);
}
if (currentClockHour < 0 || currentClockHour > 23 || currentClockMinute < 0 || currentClockMinute > 59) {
    console.error("Error: Invalid time provided. Hour must be 0-23, Minute 0-59.");
    process.exit(1);
}

/**
 * Calculates the angular position of a clock hand in degrees.
 * @param {number} value The minute or hour value.
 * @param {string} unitType 'minute' for minute hand, 'hour' for hour hand.
 * @returns {number} The angle in degrees (0-360).
 */
const calculateHandAngle = (value, unitType) => {
    switch (unitType) {
        case 'minute':
            // Minute hand moves 360 degrees in 60 minutes, so 6 degrees per minute.
            return value * 6.0;
        case 'hour':
            // Hour hand moves 360 degrees in 12 hours, so 30 degrees per hour.
            // It also moves an additional amount based on the current minute.
            // Normalize hour to 12-hour format for calculation (0-11 for 12, 1-11 for others).
            const normalizedHourForCalculation = value % 12;
            const hourContribution = normalizedHourForCalculation * 30.0;
            const minuteContributionToHourHand = (currentClockMinute / 60.0) * 30.0;
            return hourContribution + minuteContributionToHourHand;
        default:
            // Should not happen with validated input, but good practice for robustness
            console.error("Internal Error: Unknown unit type for hand angle calculation.");
            process.exit(1);
    }
};

// Calculate the angular position of the minute hand
const minuteHandPositionDegrees = calculateHandAngle(currentClockMinute, 'minute');

// Calculate the angular position of the hour hand
const hourHandPositionDegrees = calculateHandAngle(currentClockHour, 'hour');

// Determine the raw absolute difference between the two hand positions
let rawAngularDifference = Math.abs(minuteHandPositionDegrees - hourHandPositionDegrees);

// Normalize the angular difference to represent the smallest angle between the hands (0 to 180 degrees)
// For example, if the difference is 270 degrees, the smaller angle is 360 - 270 = 90 degrees.
const normalizedAngularDifference = Math.min(rawAngularDifference, 360.0 - rawAngularDifference);

// Define a constant for converting degrees to radians
const DEGREES_TO_RADIANS_CONVERSION_FACTOR = Math.PI / 180.0;

// Convert the normalized angle from degrees to radians, as Math.cos expects radians
const angleInRadians = normalizedAngularDifference * DEGREES_TO_RADIANS_CONVERSION_FACTOR;

// // Optional: Detailed logging for debugging purposes (Type III addition)
// console.log(`Debug Info:`);
// console.log(`  Minute Hand Angle: ${minuteHandPositionDegrees.toFixed(2)} deg`);
// console.log(`  Hour Hand Angle: ${hourHandPositionDegrees.toFixed(2)} deg`);
// console.log(`  Raw Angular Difference: ${rawAngularDifference.toFixed(2)} deg`);
// console.log(`  Normalized Angular Difference: ${normalizedAngularDifference.toFixed(2)} deg`);
// console.log(`  Angle in Radians: ${angleInRadians.toFixed(4)} rad`);

// Apply the Law of Cosines to compute the distance between the tips of the two arms.
// Formula: c^2 = a^2 + b^2 - 2ab * cos(C)
// Where 'a' and 'b' are arm lengths, 'C' is the angle between them, and 'c' is the distance.

// Calculate the square of the first arm's length
const squaredLengthOfFirstArm = firstArmLength * firstArmLength;

// Calculate the square of the second arm's length
const squaredLengthOfSecondArm = secondArmLength * secondArmLength;

// Calculate the product term '2ab'
const twiceProductOfArmLengths = 2 * firstArmLength * secondArmLength;

// Compute the cosine of the angle in radians
const cosineOfSeparationAngle = Math.cos(angleInRadians);

// Calculate the term '2ab * cos(C)'
const cosineTermForSubtraction = twiceProductOfArmLengths * cosineOfSeparationAngle;

// Calculate the square of the distance using the Law of Cosines
let preliminarySquaredDistance = squaredLengthOfFirstArm + squaredLengthOfSecondArm - cosineTermForSubtraction;

// Guard against potential negative values due to floating-point inaccuracies
// The squared distance should never be negative for real-world measurements.
const finalSquaredDistanceValue = Math.max(0, preliminarySquaredDistance);

// Finally, calculate the square root to get the actual distance
const calculatedEuclideanDistance = Math.sqrt(finalSquaredDistanceValue);

// Output the final computed distance, formatted to a specific number of decimal places for precision
console.log(calculatedEuclideanDistance.toFixed(9));