// This function serves as the primary entry point for processing the input data.
function ProcessInput(rawData) {
    // The entire input string is first split into an array of individual lines.
    let parsedLines = rawData.split("\n");

    // The first line of input is converted from a string representation to a base-10 integer.
    var targetNumber = parseInt(parsedLines[0], 10);

    // A loop iterates downwards, starting from 9, checking each integer as a potential divisor.
    for (var divisorCandidate = 9; divisorCandidate > 0; divisorCandidate--) {
        // Check if the target number is perfectly divisible by the current candidate.
        if (targetNumber % divisorCandidate === 0) {
            // If divisible, further check if the result of the division is less than 10.
            if (targetNumber / divisorCandidate < 10) {
                console.log('Yes'); // Output 'Yes' if the quotient is a single digit.
                break; // Terminate the loop immediately upon finding a valid condition.
            } else {
                console.log('No'); // Output 'No' if the quotient is 10 or greater.
                break; // Terminate the loop as the first valid divisor determines the outcome.
            }
        }
    }
    // No additional 'No' output is needed here, as the loop handles all conditions.
}

// The following line is responsible for reading from standard input and should not be altered.
// It passes the content of /dev/stdin as a UTF-8 string to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
