// Ensure the standard input stream is active and ready to receive data.
process.stdin.resume();
// Set the character encoding for the input stream to UTF-8 for broad compatibility.
process.stdin.setEncoding("utf8");

// A dynamic array to accumulate all lines received from the standard input.
let inputSegments = [];

// Initialize the readline interface, which facilitates processing input line by line.
const inputProcessor = require("readline").createInterface({
    input: process.stdin,  // Use standard input as the source.
    output: process.stdout // Standard output is specified, though not directly used for prompts in this logic.
});

// Register an event handler for each 'line' of input that is received.
inputProcessor.on("line", (currentSegment) => {
    // Add the current line to our buffer after removing any leading or trailing whitespace.
    inputSegments.push(currentSegment.trim());
});

// Register an event handler for the 'close' event, which signifies the end of the input stream.
inputProcessor.on("close", () => {
    // --- Core application logic begins here, executed once all input is gathered ---

    // A preliminary check: ensure that at least one line of input was provided.
    // If no input or an empty first line, log an error and terminate execution.
    if (inputSegments.length === 0 || !inputSegments[0]) {
        console.error("Error: Input stream closed without providing any data. Exiting.");
        return; // Halt further processing.
    }

    // Process the very first line of input.
    // Split it into tokens using one or more whitespace characters as delimiters.
    // This allows for flexible spacing between the expected numerical values.
    const initialTokens = inputSegments[0].split(/\s+/);

    // Validate the number of tokens: we expect exactly two numerical values.
    if (initialTokens.length !== 2) {
        console.error("Error: Expected precisely two numerical tokens on the first line. Detected:", initialTokens.length, "tokens.");
        return; // Halt if the input format is incorrect.
    }

    // Parse the first token into an integer, using base 10.
    const primaryNum = parseInt(initialTokens[0], 10);
    // Parse the second token into an integer, using base 10.
    const secondaryNum = parseInt(initialTokens[1], 10);

    // Validate that both parsed values are indeed valid numbers (not NaN).
    if (isNaN(primaryNum) || isNaN(secondaryNum)) {
        console.error("Error: One or both input values are not valid integers. Please provide numerical data.");
        return; // Halt if the parsed values are not numbers.
    }

    // Declare a variable to store the final computed outcome.
    let finalOutcome;

    // Calculate the remainder when primaryNum is divided by secondaryNum.
    const divisionRemainder = primaryNum % secondaryNum;

    // Apply the core conditional logic based on the remainder.
    if (divisionRemainder === 0) {
        // If the remainder is zero, primaryNum is perfectly divisible by secondaryNum.
        // In this case, the final outcome is the primary number itself.
        finalOutcome = primaryNum;
    } else {
        // If there is a non-zero remainder, primaryNum is not perfectly divisible.
        // The secondary number needs to be decremented by one.
        const adjustedSecondaryNum = secondaryNum - 1;
        // The final outcome is this adjusted secondary number.
        finalOutcome = adjustedSecondaryNum;
    }

    // Output the calculated final outcome to the standard console.
    console.log(finalOutcome);

    // --- End of core application logic ---
});