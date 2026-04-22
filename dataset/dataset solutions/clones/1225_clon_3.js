'use strict';

// A constant defining the expected number of numeric parameters in each input line.
const EXPECTED_INPUT_COUNT = 5;

/**
 * Parses a raw string line from standard input into an array of floating-point numbers.
 * Includes robust error handling for common input issues.
 * @param {string} rawInputText The raw string data received from stdin.
 * @returns {Array<number>|null} An array of parsed numbers if successful, otherwise null.
 */
function processInputLine(rawInputText) {
    const cleansedInput = rawInputText.trim();

    // Type III: Add a guard clause for empty input lines.
    if (cleansedInput.length === 0) {
        console.error("Input Processing Error: Received an empty input line. Skipping.");
        return null;
    }

    // Type II: Rename 'inputs' to 'tokenizedValues' for better clarity.
    const tokenizedValues = cleansedInput.split(' ');

    // Type III: Validate the number of input tokens.
    if (tokenizedValues.length !== EXPECTED_INPUT_COUNT) {
        console.error(`Input Processing Error: Expected ${EXPECTED_INPUT_COUNT} values, but received ${tokenizedValues.length}. Skipping.`);
        return null;
    }

    // Type II: Use `parseFloat` for numeric conversion, which is more appropriate for general numbers.
    // Type III: Use `map` for a more concise and functional approach to parsing multiple values.
    const numericParameters = tokenizedValues.map(val => parseFloat(val));

    // Type III: Validate that all parsed values are indeed numbers.
    if (numericParameters.some(isNaN)) {
        console.error("Input Processing Error: One or more provided values are not valid numbers. Skipping.");
        return null;
    }

    return numericParameters;
}

/**
 * Emits the final decision ("Yes" or "No") to the console.
 * @param {boolean} isAffirmative A boolean indicating whether the condition was met.
 */
function outputDecision(isAffirmative) {
    if (isAffirmative) {
        console.log('Yes'); // Affirmative outcome.
    } else {
        console.log('No');  // Negative outcome.
    }
}

// Attach an event listener to the standard input stream for 'data' events.
// This function will be executed whenever data is available from stdin.
process.stdin.on('data', function(inputBuffer) {
    // Type II: Rename 'chunk' to 'inputBuffer' for better description of a Buffer object.
    const currentInputLine = inputBuffer.toString();

    // Type III: Utilize the helper function for robust input parsing and validation.
    const geometryParameters = processInputLine(currentInputLine);

    // If `processInputLine` returned null, it means there was an error,
    // and an error message has already been logged. We just return here.
    if (geometryParameters === null) {
        return;
    }

    // Type II: Destructure the parsed array into clearly named constants.
    const [
        containerWidth,
        containerHeight,
        objectCenterX,
        objectCenterY,
        objectRadius
    ] = geometryParameters;

    // Type III: Add additional validation for the geometric properties themselves.
    // Ensure dimensions are positive and radius is non-negative.
    if (containerWidth <= 0 || containerHeight <= 0) {
        console.error("Validation Error: Container dimensions (width, height) must be strictly positive.");
        outputDecision(false);
        return;
    }
    if (objectRadius < 0) {
        console.error("Validation Error: Object radius cannot be a negative value.");
        outputDecision(false);
        return;
    }

    // Type II & III: Introduce intermediate variables with descriptive names for the
    // transformed coordinates, preserving the original mathematical logic exactly.
    // These transformations are unique to the original problem's definition.
    const transformedXCoordinateMin = containerWidth - objectCenterX - objectRadius;
    const transformedXCoordinateMax = containerWidth - objectCenterX + objectRadius;
    const transformedYCoordinateMin = containerHeight - objectCenterY - objectRadius;
    const transformedYCoordinateMax = containerHeight - objectCenterY + objectRadius;

    // Type III: Break down the single complex conditional into a series of boolean checks
    // for improved readability and to demonstrate structural modification.
    let meetsXLowerBoundCriterion = false;
    if (transformedXCoordinateMin >= 0) {
        meetsXLowerBoundCriterion = true;
    }

    let meetsXUpperBoundCriterion = false;
    if (transformedXCoordinateMax <= containerWidth) {
        meetsXUpperBoundCriterion = true;
    }

    let meetsYLowerBoundCriterion = false;
    // NOTE: The original logic uses `<= 0` for the lower Y-bound, which is a specific and
    // potentially unusual requirement, but it is preserved here for functional equivalence.
    if (transformedYCoordinateMin <= 0) {
        meetsYLowerBoundCriterion = true;
    }

    let meetsYUpperBoundCriterion = false;
    // NOTE: Similarly, the original logic uses `>= H` for the upper Y-bound.
    if (transformedYCoordinateMax >= containerHeight) {
        meetsYUpperBoundCriterion = true;
    }

    // Type III: Combine all individual criteria to determine the final outcome.
    const overallConditionMet = meetsXLowerBoundCriterion &&
                                 meetsXUpperBoundCriterion &&
                                 meetsYLowerBoundCriterion &&
                                 meetsYUpperBoundCriterion;

    // Type III: Use the helper function to output the final result.
    outputDecision(overallConditionMet);
});

// Ensure the standard input stream remains active to continuously listen for data.
process.stdin.resume();
// Set the character encoding for incoming standard input data to UTF-8.
process.stdin.setEncoding('utf8');