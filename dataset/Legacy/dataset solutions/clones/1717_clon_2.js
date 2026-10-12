// This function processes the entire input data.
function ProcessInput(rawData) {
    var finalValue = 0; // Initialize the result accumulator.

    // The input string is first cleaned of leading/trailing whitespace,
    // then split into an array of lines based on newline characters.
    rawData = rawData.trim().split("\n");

    // The following lines are commented out in the original and are not active logic.
    // var lineSegments = rawData.trim().split("\n");
    // var firstLineNumbers = rawData[0].split(' ').map(val => parseInt(val));

    // Parse the primary numerical value from the processed input array.
    // When parseInt is called with an array, it attempts to parse the first element.
    var parsedNumber = parseInt(rawData);

    // Calculate the sum of the number, its square, and its cube.
    finalValue = parsedNumber + (parsedNumber * parsedNumber) + (parsedNumber * parsedNumber * parsedNumber);

    // Output the computed result to the console.
    console.log(finalValue);
}

// The lines below handle standard input/output and function invocation.
// They should not be modified to preserve the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
// An alternative for local testing, reading from a file named 'input.txt':
// ProcessInput(require('fs').readFileSync('./input.txt', 'utf-8'));
