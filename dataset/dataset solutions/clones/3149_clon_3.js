// Main processing unit for incoming data streams
const processInputData = (rawInputContent) => {
    // Normalize and segment the raw string input into an array of lines.
    // This step ensures consistent handling across different environments.
    const inputLines = rawInputContent.trim().split('\n');

    // A sentinel variable to hold the numerical representation of the primary input token.
    let numericIdentifier;

    // A flag to store the final computed output value based on the input's characteristic.
    let outcomeIndicator;

    // Implement a preliminary check to ensure that valid input lines are present.
    // This acts as a guard clause against empty or malformed input streams.
    if (inputLines.length === 0) {
        // If no lines are found, log a warning and assign a default error-like state.
        // This signifies an unprocessable input scenario.
        console.warn("No discernable input lines provided. Assigning default failure state.");
        outcomeIndicator = -1; // A distinct value for an empty input scenario.
    } else {
        // Attempt to extract the first significant token from the very first line.
        // We assume the relevant data is the initial sequence of characters before any whitespace.
        const firstLineSegment = inputLines[0].split(" ")[0];

        // Convert the extracted string segment into an integer.
        // The radix (base 10) is explicitly specified for robust parsing.
        numericIdentifier = parseInt(firstLineSegment, 10);

        // Introduce a boolean helper to clearly express the primary conditional logic.
        // This makes the subsequent conditional block more readable.
        const isInputTargetZero = (numericIdentifier === 0);

        // Evaluate the condition and set the outcome indicator.
        // This structure is a direct rewrite of the original conditional assignment.
        if (isInputTargetZero) {
            // If the numeric identifier is indeed zero, the outcome is set to '1'.
            outcomeIndicator = 1;
        } else {
            // For any other case, including non-numeric input, the outcome defaults to '0'.
            // An additional check for NaN is added for explicit handling of non-numerical input,
            // though it ultimately leads to the same '0' outcome as per original logic for non-zero.
            if (isNaN(numericIdentifier)) {
                console.info("Input token was not a valid number. Interpreting as non-zero for outcome.");
            }
            outcomeIndicator = 0;
        }
    }

    // Display the determined outcome indicator to the standard output.
    // This is the final step of the computation process.
    console.log(outcomeIndicator);
};

// Execution entry point: This section is responsible for reading the system's standard input
// and passing it to the core processing function. It uses Node.js file system utilities.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));