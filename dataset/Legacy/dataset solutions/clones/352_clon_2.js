function processEquations() {
    // Iterate over each equation string provided in the input data.
    rawData.forEach(function (equationString) {
        // Split the equation string into two main parts: the left side (expression) and the right side (result).
        let parts = equationString.split("=");

        // Further split the left side expression into its individual operands.
        let leftSideOperands = parts[0].split("+");

        // Initialize a variable to store the found digit; -1 indicates no solution yet.
        let solutionDigit = -1;

        // Loop through all possible single-digit numbers (0 through 9) as candidates for 'X'.
        for (let digitCandidate = 0; digitCandidate < 10; digitCandidate++) {
            // Check for a specific invalid case: if the digit candidate is 0,
            // and any of the numbers (operand A, operand B, or the result)
            // start with 'X', then this substitution is invalid.
            // For example, "X1" cannot become "01" as a valid number.
            if (digitCandidate === 0 &&
                (leftSideOperands[0][0] === "X" ||
                 leftSideOperands[1][0] === "X" ||
                 parts[1][0] === "X")) {
                continue; // Skip this digit candidate and try the next one.
            }

            // Replace all occurrences of 'X' with the current digit candidate
            // in each part of the equation and convert them to integers.
            let operandA = parseInt(leftSideOperands[0].replace(/X/g, digitCandidate));
            let operandB = parseInt(leftSideOperands[1].replace(/X/g, digitCandidate));
            let resultValue = parseInt(parts[1].replace(/X/g, digitCandidate));

            // Check if the equation holds true with the current digit substitution.
            if (operandA + operandB === resultValue) {
                solutionDigit = digitCandidate; // A valid digit has been found.
                break; // Exit the loop as we only need the first (smallest) valid digit.
            }
        }

        // Output the found digit or "NA" if no valid digit was found after checking all possibilities.
        console.log((solutionDigit < 0) ? "NA" : solutionDigit);
    });
}

// Declare a global variable to accumulate data received from standard input.
let rawData = '';

// Resume the standard input stream to begin listening for data.
process.stdin.resume();
// Set the character encoding for the incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Attach an event listener to handle incoming data chunks.
// Each time data is received, append it to the 'rawData' string.
process.stdin.on('data', function (dataChunk) {
    rawData += dataChunk;
});

// Attach an event listener for the 'end' event, which signals that all input has been received.
process.stdin.on('end', function () {
    // Once all data is received, clean it up:
    // 1. Remove any leading or trailing whitespace.
    // 2. Split the string into an array of individual lines (equations).
    rawData = rawData.trim().split('\n');
    // Call the main function to process the prepared array of equations.
    processEquations();
});
