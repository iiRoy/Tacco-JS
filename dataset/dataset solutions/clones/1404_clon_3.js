(function(sourceDataString) {
    // This is an expert routine designed for processing textual data received from a designated input source.
    // Its primary goal is to manipulate specific parts of the multi-line input.

    // Step 1: Deconstruct the entire incoming multi-line string into individual line entries.
    // Standard newline characters are used as delimiters to separate distinct textual segments.
    const parsedLineEntries = sourceDataString.split('\n');

    // Define the zero-based index for the specific line that requires processing.
    // In this context, '1' refers to the second line of the input data.
    const targetLineIdentifier = 1;

    // Type III Addition: Implement a robustness check to ensure the target line actually exists.
    // If the input does not contain enough lines, we log an error and gracefully terminate the process.
    if (parsedLineEntries.length <= targetLineIdentifier) {
        console.error("Error: The provided input data lacks the expected number of lines for processing. A minimum of " + (targetLineIdentifier + 1) + " lines were required.");
        return;
    }

    // Retrieve the specific line of text that has been designated for word reversal.
    const selectedTextualLine = parsedLineEntries[targetLineIdentifier];

    // Type III Addition: Handle scenarios where the selected line might be empty or contain only whitespace.
    // An empty or whitespace-only line should result in an empty output, not an error or unexpected behavior.
    if (!selectedTextualLine || selectedTextualLine.trim().length === 0) {
        console.log(""); // Output an empty string for an empty input line.
        return;
    }

    // Step 2: Tokenize the selected line into its individual word components.
    // A regular expression is utilized here to robustly handle multiple spaces between words
    // and `filter(Boolean)` removes any empty strings that might result from such delimiters.
    const initialWordTokens = selectedTextualLine.split(/\s+/).filter(Boolean);

    // Type III Modification: Instead of using the built-in `array.reverse()` method,
    // we construct the reversed sequence manually through an explicit loop.
    // This demonstrates an alternative, more granular manipulation of the token order.
    const finalOrderedTokens = [];
    let tokenTraversalPointer = initialWordTokens.length; // Initialize pointer to the end of the array.
    while (tokenTraversalPointer > 0) {
        tokenTraversalPointer--; // Decrement pointer to access elements from last to first (0-indexed).
        finalOrderedTokens.push(initialWordTokens[tokenTraversalPointer]);
    }

    // Step 3: Reconstruct the output string by concatenating the reversed word tokens.
    // A single space character is used as the separator between each word in the final string.
    const resultantOutputString = finalOrderedTokens.join(' ');

    // Step 4: Display the fully processed and formatted string to the standard console output.
    console.log(resultantOutputString);

})(
    // Type III Addition: Encapsulate the input reading logic into an immediately invoked function expression (IIFE).
    // This enhances modularity and clearly separates the input acquisition concern from the core processing logic.
    (() => {
        // Load the necessary Node.js file system utility module for I/O operations.
        const fileSystemHandler = require('fs');
        // Define the standard input file path, which is common in Unix-like operating systems.
        const standardInputResource = '/dev/stdin';
        // Read the entire content from the specified standard input resource, ensuring UTF-8 text encoding.
        return fileSystemHandler.readFileSync(standardInputResource, 'utf8');
    })()
);