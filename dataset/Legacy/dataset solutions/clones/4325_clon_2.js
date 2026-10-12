process.stdin.resume(); // Initialize standard input stream
process.stdin.setEncoding('utf8'); // Configure input encoding to UTF-8

let globalInputBuffer = ''; // Buffer to store all incoming data from stdin

// Event listener for 'data' chunks received from stdin
process.stdin.on('data', function(incomingChunk) {
    globalInputBuffer += incomingChunk; // Append each data chunk to the buffer
});

// Event listener for 'end' of stdin stream
process.stdin.on('end', function() {
    // Once all input is received, split it into lines and pass to the main processing function
    ProcessInputData(globalInputBuffer.split(/\r?\n/));
});

/**
 * Processes the input data to find integer solutions for a specific equation.
 * The equation is derived from 4/N = 1/h + 1/n + 1/w.
 * @param {string[]} dataLines - An array of strings, where the first element contains the integer N.
 * @returns {number} - Returns 0 upon completion.
 */
function ProcessInputData(dataLines) {
    // Parse the first line of input as the target integer N
    const targetValue = parseInt(dataLines[0], 10);

    // Declare variables for the equation's components
    let varX = 0; // Corresponds to 'h' in the original problem
    let varY = 0; // Corresponds to 'n' in the original problem
    let varZ = 0; // Corresponds to 'w' in the original problem

    // Pre-calculate constant coefficients for efficiency
    const coeffA = 4 / targetValue; // Represents 4/N
    const coeffB = 2 / 3500;        // A constant value, unused in the final logic but present in original comments
    const coeffC = 1 / 3500;        // Another constant value, unused in the final logic but present in original comments

    let solutionFound = false; // Flag to track if a valid solution (h, n, w) has been identified

    // Iterate through possible values for the first variable, 'h' (renamed to varX)
    // The loop runs from 1 up to 3500, inclusive.
    for (varX = 1; varX <= 3500; varX++) {

        // Iterate through possible values for the second variable, 'n' (renamed to varY)
        // The loop starts from 'h' (varX) to ensure n >= h, and runs up to 3500.
        for (varY = varX; varY <= 3500; varY++) {

            // Calculate the denominator for 'w' (varZ) to avoid division by zero.
            // This corresponds to (4hn - Nh - Nn) from the rearranged equation.
            const denominatorTerm = (4 * varX * varY) - (targetValue * varX) - (targetValue * varY);

            // Proceed only if the denominator is not zero
            if (denominatorTerm !== 0) {
                // Calculate 'w' (varZ) using the rearranged equation: w = (Nhn) / (4hn - Nh - Nn)
                // Math.ceil is used as per the original problem's logic.
                varZ = Math.ceil((targetValue * varX * varY) / denominatorTerm);

                // Check if 'w' (varZ) is positive and if the original equation holds true
                // 4/N === 1/h + 1/n + 1/w
                if (varZ > 0 && coeffA === (1 / varX) + (1 / varY) + (1 / varZ)) {
                    solutionFound = true; // A solution has been found
                    break; // Exit the inner loop (for varY) as we found a solution
                }
            }

            // If a solution was found in the current iteration of the inner loop,
            // break out of the inner loop immediately.
            if (solutionFound) {
                break;
            }
        }

        // If a solution was found in the middle loop (for varY),
        // break out of the outer loop (for varX) immediately.
        if (solutionFound) {
            break;
        }
    }

    // Output the values of h, n, and w (varX, varY, varZ) that satisfy the condition.
    // If no solution is found, the last tried values will be printed.
    console.log(varX + ' ' + varY + ' ' + varZ);

    return 0; // Indicate successful execution of the function
}
