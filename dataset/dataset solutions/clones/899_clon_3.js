// This section ensures the Node.js process can receive and interpret standard input.
// It keeps the input stream active and sets the character encoding to UTF-8 for proper text handling.
process.stdin.resume();
process.stdin.setEncoding('utf8');

/**
 * Normalizes an angular fraction by dividing both its numerator and the base of its 2-power denominator
 * by 2 repeatedly, as long as the numerator is even and the denominator power is greater than zero.
 * This effectively reduces the fraction to its simplest form where the numerator is odd or the
 * denominator power is zero.
 *
 * @param {number} currentNumerator - The current value of the numerator.
 * @param {number} currentDenominatorPower - The exponent (power of 2) for the denominator.
 * @returns {{simplifiedNumerator: number, simplifiedDenominatorPower: number}} An object containing
 *          the simplified numerator and its corresponding denominator power.
 */
const simplifyAngularFraction = (currentNumerator, currentDenominatorPower) => {
    // Continue simplification as long as there's a denominator to reduce (power > 0)
    // and the numerator is an even number, allowing for division by 2.
    while (currentDenominatorPower > 0 && currentNumerator % 2 === 0) {
        currentNumerator /= 2;         // Halve the numerator.
        currentDenominatorPower--;     // Decrease the exponent of the denominator.
    }
    // Return the results in a structured object.
    return {
        simplifiedNumerator: currentNumerator,
        simplifiedDenominatorPower: currentDenominatorPower
    };
};

// Define constants for key values used throughout the script.
// This improves readability, maintainability, and makes values easily configurable.
const BASE_ANGLE_UNIT = 90;           // The fundamental angular unit (e.g., 90 degrees).
const INPUT_TERMINATION_SEQUENCE = "#"; // Special string indicating the end of input processing.
const NORTH_DIRECTION_CODE = '0';     // String code representing the 'north' direction.
const WEST_DIRECTION_CODE = '1';      // String code representing the 'west' direction.

// Attach an event listener to the standard input stream.
// This function will be executed whenever a chunk of data is received.
process.stdin.on('data', (inputDataBuffer) => {
    // Convert the incoming data buffer to a string, then split it into an array of lines.
    // The `.filter(Boolean)` method removes any empty strings that might result from splitting
    // (e.g., if the input ends with a newline).
    const incomingTextLines = inputDataBuffer.toString().split('\n').filter(Boolean);

    // Iterate through each line of text received from the input.
    for (let currentLineIdx = 0; currentLineIdx < incomingTextLines.length; ++currentLineIdx) {
        // Retrieve the current line and remove any leading or trailing whitespace.
        let processedLineContent = incomingTextLines[currentLineIdx].trim();

        // Check if the current line matches the termination sequence.
        // If it does, stop processing further lines and exit the loop.
        if (processedLineContent === INPUT_TERMINATION_SEQUENCE) {
            break;
        }

        // If the line is empty after trimming, skip to the next line.
        if (processedLineContent.length === 0) {
            continue;
        }

        // Replace all occurrences of 'north' and 'west' (case-insensitive) with their
        // respective numeric string codes. The 'g' flag ensures global replacement.
        processedLineContent = processedLineContent.replace(/north/gi, NORTH_DIRECTION_CODE);
        processedLineContent = processedLineContent.replace(/west/gi, WEST_DIRECTION_CODE);

        // Initialize the accumulator for the calculated angular value.
        let finalAngularValue = 0;
        // Determine the initial power for the denominator based on the length of the processed line.
        // This sets the initial scale for the angular steps.
        let currentDenominatorExponent = processedLineContent.length - 1;

        // Calculate the maximum possible angle for the given line length.
        // This serves as an upper bound for the angular value calculation process.
        const maximumAllowedAngle = BASE_ANGLE_UNIT * Math.pow(2, currentDenominatorExponent);

        // Loop through each character in the processed line to compute the final angle.
        for (let charPosition = 0; charPosition < processedLineContent.length; ++charPosition) {
            const currentCharacter = processedLineContent[charPosition];
            // Calculate the angular increment/decrement for the current character's position.
            // The step value decreases as we move further into the string.
            const angularMagnitudeStep = BASE_ANGLE_UNIT * Math.pow(2, currentDenominatorExponent - charPosition);

            // The original logic implicitly checks `line[j]*1`. If `line[j]` was '1', `*1` is `1` (truthy).
            // If `line[j]` was '0' or any other character (e.g., 'a'), `*1` is `0` or `NaN` (falsy).
            // This means '1' causes addition, and anything else causes subtraction.
            if (currentCharacter === WEST_DIRECTION_CODE) { // If the character is '1'
                // Add the step, but ensure the angle does not exceed its maximum bound.
                if (finalAngularValue < maximumAllowedAngle) {
                    finalAngularValue += angularMagnitudeStep;
                }
            } else { // If the character is not '1' (includes '0', or any other unexpected character)
                // Subtract the step, but ensure the angle does not go below zero.
                if (finalAngularValue > 0) {
                    finalAngularValue -= angularMagnitudeStep;
                }
            }
        }

        // After all characters are processed, simplify the resulting angular fraction.
        const { simplifiedNumerator, simplifiedDenominatorPower } = simplifyAngularFraction(finalAngularValue, currentDenominatorExponent);

        // Output the simplified angle.
        // If the denominator power is still positive, print it as a fraction.
        // Otherwise, it's a whole number, so print just the numerator.
        if (simplifiedDenominatorPower > 0) {
            console.log(`${simplifiedNumerator}/${Math.pow(2, simplifiedDenominatorPower)}`);
        } else {
            console.log(simplifiedNumerator.toFixed(0)); // .toFixed(0) ensures integer representation without decimal.
        }
    }
});

// Optional: Add an event listener for the 'end' of the input stream.
// This can be useful for cleanup or to indicate that all input has been processed.
// process.stdin.on('end', () => {
//     console.log('All input data has been processed successfully.');
// });