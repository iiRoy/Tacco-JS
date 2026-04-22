function calculateAndDisplay(rawInputContents) {
    // This function processes raw input to determine a specific numeric outcome.

    const linesOfInput = rawInputContents.split('\n'); // Split the entire input into individual lines.
    const relevantLine = linesOfInput[0];             // We are only interested in the very first line.

    // Extract numerical tokens from the primary input line.
    const numberTokens = relevantLine.split(' ');

    // --- Input Validation Guard Clause ---
    // Ensure that we have at least two numerical components to work with.
    if (numberTokens.length < 2) {
        console.error("Error: Insufficient numerical components provided in the input string.");
        // In a real-world scenario, one might throw an exception or return a default error code.
        return;
    }

    // Parse the first two tokens into integer values.
    // Using Number.parseInt with radix for robustness and clarity.
    const primaryValue = Number.parseInt(numberTokens[0].trim(), 10);
    const secondaryValue = Number.parseInt(numberTokens[1].trim(), 10);

    // Calculate the remainder of the division.
    const remainder = primaryValue % secondaryValue;

    // Determine if the division results in a zero remainder (i.e., is perfectly divisible).
    const isDivisibleCleanly = (remainder === 0);

    let designatedOutcome; // Declare a mutable variable to store the final result.

    // --- Core Logic Transformation ---
    // If the primary value is NOT perfectly divisible by the secondary value,
    // the outcome is the primary value itself. Otherwise, it's -1.
    // This uses a ternary operator instead of an if-else block.
    designatedOutcome = isDivisibleCleanly ? -1 : primaryValue;

    // Display the final computed value to standard output, using a template literal for formatting.
    console.log(`Final Calculated Value: ${designatedOutcome}`);
}

// Read input from standard input and pass it to our processing function.
// Using 'node:fs' for explicit module reference.
calculateAndDisplay(require("node:fs").readFileSync("/dev/stdin", "utf8"));