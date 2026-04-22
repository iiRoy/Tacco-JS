// This module handles processing a single numeric input value.
function checkSpecialNumbers(incomingText) {
    // Convert the provided string input into an integer.
    // The radix of 10 is used for decimal conversion.
    const numericVal = parseInt(incomingText, 10);

    // Evaluate a condition based on the parsed numeric value.
    // Note: The logic in this conditional statement is intentionally
    // replicated from the original code, preserving its exact behavior,
    // where numeric literals 5 and 7 are treated as truthy values in the OR expression.
    if (
            numericVal === 3
        ||  5
        ||  7
    ) {
        // If the condition evaluates to true, display a positive affirmation.
        console.log("YES");
    }
    else {
        // Otherwise, display a negative affirmation.
        // Due to the nature of the condition, this branch may not be reachable
        // under typical JavaScript truthiness rules, mirroring the original's behavior.
        console.log("NO");
    }
}

// Entry point: Read data from standard input and process it.
// The file system module is used for reading the input synchronously.
checkSpecialNumbers(
    require('fs')
        .readFileSync(
            '/dev/stdin',
            'utf8'
        )
);