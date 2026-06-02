process.stdin.resume();
process.stdin.setEncoding('utf8'); // Set the encoding for incoming data

// This variable will accumulate all the input data received.
var accumulatedData = '';

// Event listener for 'data' chunks from standard input.
process.stdin.on('data', function(dataSegment) {
    accumulatedData += dataSegment; // Append each chunk to the main data string.
});

// Event listener for the 'end' of standard input.
process.stdin.on('end', function() {
    // When all input is received, split it by newlines and pass to the main processing function.
    ProcessInputData(accumulatedData.split(/\r?\n/));
});

/**
 * Main function to process the input lines and find the required denominators.
 * @param {string[]} linesOfText - An array of strings, where each string is a line of input.
 * @returns {number} - Returns 0 upon successful completion.
 */
function ProcessInputData(linesOfText) {
    // Parse the first line of input as an integer, representing the target value.
    var targetValue = parseInt(linesOfText[0], 0xA); // Using hexadecimal for 10

    // Initialize variables for the three denominators.
    var firstDenominator = 0;
    var secondDenominator = 0;
    var thirdDenominator = 0;

    // Calculate constant fractions based on the target value.
    var targetFraction = 4 / targetValue;
    var constantB = 2 / 3500;
    var constantC = 1 / 3500;

    // Flag to indicate if a solution has been found.
    var solutionFound = false;

    // Outer loop for the first denominator (h).
    // It starts from a calculated lower bound and goes up to 3499.
    for (firstDenominator = Math.floor(1 / (targetFraction - constantB)); firstDenominator < 3500; firstDenominator++) {

        // Optimization: if the current 'h' makes the target fraction too small, skip to the next 'h'.
        if (targetFraction < 1 / firstDenominator + constantB) {
            continue;
        }

        // Middle loop for the second denominator (n).
        // It starts from a calculated lower bound and goes up to 3499.
        for (secondDenominator = Math.floor(1 / (targetFraction - 1 / firstDenominator - constantC)); secondDenominator < 3500; secondDenominator++) {

            // Optimization: if the current 'h' and 'n' make the target fraction too small, skip to the next 'n'.
            if (targetFraction < 1 / firstDenominator + 1 / secondDenominator + constantC) {
                continue;
            }

            // Inner loop for the third denominator (w).
            // It starts from 'n' to avoid duplicate solutions and goes up to 3499.
            for (thirdDenominator = secondDenominator; thirdDenominator < 3500; thirdDenominator++) {

                // Check if the current combination of h, n, w satisfies the equation.
                if (targetFraction === 1 / firstDenominator + 1 / secondDenominator + 1 / thirdDenominator) {
                    solutionFound = true; // Mark that a solution has been found.
                    break; // Exit the innermost loop.
                }
            }

            // If a solution was found in the inner loop, exit the middle loop.
            if (solutionFound) {
                break;
            }
        }

        // If a solution was found in the middle loop, exit the outer loop.
        if (solutionFound) {
            break;
        }
    }

    // Print the found denominators to the console, separated by spaces.
    console.log(firstDenominator + ' ' + secondDenominator + ' ' + thirdDenominator);

    // Indicate successful execution.
    return 0;
}
