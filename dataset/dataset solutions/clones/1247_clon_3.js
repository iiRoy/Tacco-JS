// Configure the standard input stream to interpret data as UTF-8 encoded text.
process.stdin.setEncoding('utf-8');

// Declare constants for mathematical values and output formatting to enhance readability and maintainability.
const PI_VALUE_APPROXIMATION = Math.PI; // Represents the mathematical constant Pi.
const DESIRED_DECIMAL_PRECISION = 5; // Specifies the number of decimal places for output values.

/**
 * A utility function to safely parse a floating-point number from a string.
 * It handles empty or whitespace-only strings by returning NaN, similar to parseFloat behavior
 * but with explicit trim.
 * @param {string} inputString - The string to be parsed into a float.
 * @returns {number} The parsed float number, or NaN if parsing fails or input is invalid.
 */
function attemptToParseNumericalValue(inputString) {
    // Ensure the input string is not null, undefined, or just whitespace.
    if (!inputString || typeof inputString !== 'string' || inputString.trim() === '') {
        return NaN; // Return Not-a-Number for empty or invalid string inputs.
    }
    return parseFloat(inputString.trim()); // Use parseFloat after trimming leading/trailing whitespace.
}

// Establish an event listener for incoming data on the standard input stream.
// This function will execute whenever data is received.
process.stdin.on('data', (incomingDataPayload) => {
    // Convert the incoming data buffer to a string, remove leading/trailing whitespace,
    // and then split it into an array of tokens based on one or more spaces.
    const inputTokenCollection = incomingDataPayload.toString().trim().split(/\s+/);

    // --- Robust Input Validation Section ---
    // Check if any significant input tokens were provided.
    if (inputTokenCollection.length === 0 || inputTokenCollection[0].length === 0) {
        console.error('Execution Halted: No data found in the input stream. Please provide a numerical radius.');
        return; // Terminate processing if no valid input is detected.
    }

    const firstTokenCandidate = inputTokenCollection[0];
    let geometricRadius = attemptToParseNumericalValue(firstTokenCandidate);

    // Validate if the parsed value is indeed a number.
    if (isNaN(geometricRadius)) {
        console.error(`Execution Halted: Input "${firstTokenCandidate}" is not a valid number. Please enter a numerical radius.`);
        return; // Terminate if the radius is not a valid number.
    }

    // Handle cases where a negative radius might be provided, by using its absolute value.
    if (geometricRadius < 0) {
        console.warn(`Warning: A negative radius (${geometricRadius}) was entered. Calculations will proceed using its absolute value (${Math.abs(geometricRadius)}).`);
        geometricRadius = Math.abs(geometricRadius); // Use the positive equivalent for geometric calculations.
    }
    // --- End Input Validation ---

    // Compute the area of the circle using the formula: Area = Pi * r^2.
    // Using Math.pow for clarity in squaring the radius.
    const calculatedCircleSurfaceArea = PI_VALUE_APPROXIMATION * Math.pow(geometricRadius, 2);

    // Compute the circumference (perimeter) of the circle using the formula: Circumference = 2 * Pi * r.
    const calculatedCircleCircumference = 2.0 * PI_VALUE_APPROXIMATION * geometricRadius; // Explicit float 2.0.

    // Format the calculated area to the predefined number of decimal places.
    const formattedAreaString = calculatedCircleSurfaceArea.toFixed(DESIRED_DECIMAL_PRECISION);

    // Format the calculated circumference to the predefined number of decimal places.
    const formattedCircumferenceString = calculatedCircleCircumference.toFixed(DESIRED_DECIMAL_PRECISION);

    // Assemble the final output string using a template literal for clear concatenation.
    const finalResultPresentation = `${formattedAreaString} ${formattedCircumferenceString}`;

    // Print the combined, formatted results to the standard output.
    console.log(finalResultPresentation);
});

// An optional listener for the 'end' event, indicating that the input stream has closed.
// This is not strictly necessary for the problem's core functionality but can be useful for debugging.
process.stdin.on('end', () => {
    // console.log('Standard input stream has concluded.');
});