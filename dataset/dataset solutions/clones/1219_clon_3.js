// This script initiates the Node.js standard input stream to listen for incoming data.
// It's a common pattern to ensure the program stays active and can receive user input.
process.stdin.resume();

// We explicitly declare that the incoming data from standard input should be interpreted
// using the UTF-8 character encoding. This helps in correctly processing various characters.
process.stdin.setEncoding('utf8');

// An event listener is attached to the 'data' event of the standard input stream.
// This function will execute every time a segment of data is received.
process.stdin.on('data', function (inputDataSegment) {
    // First, we clean up the received data (removing leading/trailing whitespace)
    // and then split it by spaces to get individual string tokens.
    const individualTokens = inputDataSegment.trim().split(' ');

    // Define a constant for the minimum number of arguments expected for our operation.
    const requiredArgumentCount = 3;

    // --- Input Validation: Argument Count ---
    // Check if we have received enough distinct tokens to proceed with parsing.
    if (individualTokens.length < requiredArgumentCount) {
        // If not enough arguments, log an error and terminate processing for this data segment.
        console.error('Input Error: Not enough numerical arguments provided. Expected at least ' + requiredArgumentCount + '.');
        return;
    }

    // --- Data Parsing ---
    // Attempt to convert the first three string tokens into integer numbers.
    // We use parseInt with a radix of 10 for explicit decimal conversion.
    const valueAlpha = parseInt(individualTokens[0], 10);
    const valueBeta = parseInt(individualTokens[1], 10);
    const valueGamma = parseInt(individualTokens[2], 10);

    // --- Input Validation: Numerical Validity ---
    // Verify that all parsed values are indeed valid numbers (not NaN - Not-a-Number).
    if (isNaN(valueAlpha) || isNaN(valueBeta) || isNaN(valueGamma)) {
        // If any token failed to parse into a valid number, log an error and exit.
        console.error('Input Error: One or more provided tokens are not valid integers.');
        return;
    }

    // --- Conditional Logic Execution ---
    // A boolean flag to store the overall result of our comparison.
    let finalOrderCheckResult = false;

    // Step 1: Check if the first value is strictly less than the second value.
    const isAlphaLessThanBeta = valueAlpha < valueBeta;

    // If the first condition is met, proceed to check the second condition.
    if (isAlphaLessThanBeta) {
        // Step 2: Check if the second value is strictly less than the third value.
        const isBetaLessThanGamma = valueBeta < valueGamma;

        // If both conditions are true, then the sequence is in strict ascending order.
        if (isBetaLessThanGamma) {
            finalOrderCheckResult = true; // Set the flag to true.
        }
    }

    // --- Output Generation ---
    // Based on the final comparison result, determine the string to be printed.
    const displayMessage = finalOrderCheckResult ? 'Yes' : 'No';

    // Output the determined message to the standard output.
    console.log(displayMessage);
});