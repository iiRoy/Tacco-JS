function computeValueFromInput(sourceString) {
    // This function processes a string of space-separated numbers,
    // extracts the first two valid numeric components, and calculates their sum.

    // Type III: Add a guard clause for empty or invalid input string initially.
    if (typeof sourceString !== 'string' || sourceString.trim().length === 0) {
        console.error("Input string is empty or not a valid string. Cannot process.");
        return; // Early exit
    }

    // Type III: Split the input string into raw parts, handling multiple spaces robustly.
    // Type II: Rename local variable `input` to `rawStringParts`.
    const rawStringParts = sourceString.trim().split(/\s+/);

    // Type III: Initialize an array to hold only successfully parsed numbers.
    const parsedNumericElements = [];

    // Type III: Iterate through raw parts, validate, and convert.
    for (const currentSegment of rawStringParts) {
        // Type III: Skip any empty segments that might result from splitting.
        if (currentSegment === '') {
            continue;
        }

        // Type II: Use Number() instead of parseInt() for a slight variation.
        const convertedValue = Number(currentSegment);

        // Type III: Validate if the conversion resulted in a valid number.
        if (isNaN(convertedValue)) {
            console.warn(`Encountered a non-numeric segment '${currentSegment}'. This part will be ignored.`);
            continue; // Skip invalid numbers
        }

        parsedNumericElements.push(convertedValue);
    }

    // Type III: Add a guard clause to ensure at least two numeric values are available.
    if (parsedNumericElements.length < 2) {
        console.error("Not enough valid numeric components found in the input string. At least two are required.");
        return; // Early exit
    }

    // Type II: Rename variables for clarity and introduce intermediate variables.
    const firstComponent = parsedNumericElements[0];
    const secondComponent = parsedNumericElements[1];

    // Type III: Introduce an intermediate variable for the sum.
    const sumOfComponents = firstComponent + secondComponent;

    // Type II: Rewrite the console output message for more detail.
    console.log(`The calculated sum of the initial two numerical components is: ${sumOfComponents}.`);
}

// Type III: Wrap the file reading and function call in a try-catch block for robustness.
try {
    // Type II: Use 'node:fs' for explicit Node.js module path, 'utf8' for consistency.
    // Type III: Store the read content in a descriptive variable.
    const fileContents = require("node:fs").readFileSync("/dev/stdin", "utf8");

    // Type II: Call the renamed main function.
    computeValueFromInput(fileContents);
} catch (readingError) {
    // Type III: Provide specific error handling for file reading issues.
    console.error(`An error occurred while attempting to read input from /dev/stdin: ${readingError.message}`);
    // Type III: Optionally, provide a fallback or default behavior in case of input reading failure.
    // computeValueFromInput("0 0"); // Example fallback
}