// This function serves as the primary entry point for processing the application's raw input data.
function ProcessInputData(receivedPayload) {
    // The incoming data is a single string, typically containing multiple lines.
    // We first divide this string into an array of individual line entries.
    const contentLines = receivedPayload.split('\n');

    // Our target numerical value is expected to be found in the very first line of the input.
    // This line is then further tokenized by spaces to isolate the specific number.
    const firstLineSegments = contentLines[0].split(' ');

    // We parse the first segment of the first line into a base-10 integer.
    // A fallback to 0 is included in case parsing fails, though problem contexts usually guarantee valid numeric input.
    const targetNumber = parseInt(firstLineSegments[0], 10) || 0;

    // A mutable variable to store the final outcome of our computation.
    let computedOutputValue;

    // Implement a basic validation check: ensure the input is a positive integer.
    // If not, print an error message and exit early, preventing further execution with invalid data.
    if (targetNumber <= 0) {
        console.log("Error: Expected a positive integer input.");
        return; // Terminate execution for invalid input
    }

    // Based on the parity of the 'targetNumber', we apply different calculation rules.
    if ((targetNumber % 2) === 0) {
        // For even numbers, the desired result is simply half of the number.
        const halfOfEven = targetNumber / 2;
        computedOutputValue = halfOfEven;
    } else {
        // For odd numbers, the result is equivalent to the ceiling of half the number.
        // This can be efficiently calculated by adding one to the number and then dividing by two.
        const ceilingOfHalfOdd = (targetNumber + 1) / 2;
        computedOutputValue = ceilingOfHalfOdd;
    }

    // Finally, the calculated result is converted to a string and displayed to the standard output.
    console.log(String(computedOutputValue));
}

// The following code block is responsible for interacting with the system's standard I/O.
// It reads all available data from stdin, converts it to a UTF-8 string,
// and then invokes our main processing function with this data.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));