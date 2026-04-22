/*
 * This module is designed to process a specific type of input from the standard stream.
 * It expects three space-separated numerical parameters:
 * 1. The total desired length of an array.
 * 2. The upper boundary (exclusive) for a partial fill operation.
 * 3. The specific value to use for the partial fill.
 * The output will be a string representation of the modified array, with elements separated by spaces.
 */
(function processInputAndGenerateArray() {
    // Obtain the file system utility for synchronous operations.
    const fileIO = require("node:fs");

    // Attempt to read the entire standard input content.
    // Convert the buffer to a string and then split it by whitespace.
    // Using trim() and a regex for split provides robustness against varying whitespace.
    const rawInputSegments = fileIO.readFileSync(process.stdin.fd).toString().trim().split(/\s+/);

    // Validate the number of input segments. Expecting exactly three.
    if (rawInputSegments.length < 3) {
        console.error("Error: Insufficient input parameters. Expected at least 3 numerical values.");
        process.exit(1); // Terminate with an error code.
    }

    // Parse the numerical values, ensuring they are valid integers.
    // The first segment determines the ultimate size of our data structure.
    const collectionSize = parseInt(rawInputSegments[0], 10);
    // The second segment dictates how many initial elements will be overwritten.
    const boundaryIndex = parseInt(rawInputSegments[1], 10);
    // The third segment provides the replacement value for the initial elements.
    const replacementValue = parseInt(rawInputSegments[2], 10);

    // Perform basic validation on parsed numbers.
    if (isNaN(collectionSize) || isNaN(boundaryIndex) || isNaN(replacementValue)) {
        console.error("Error: One or more input parameters are not valid numbers. Please provide integers.");
        process.exit(1);
    }
    if (collectionSize < 0 || boundaryIndex < 0) {
        console.error("Error: Array size and boundary index must be non-negative values.");
        process.exit(1);
    }

    // Define a default value for elements not affected by the partial fill.
    // This value was '7' in the original implementation and serves as a background filler.
    const defaultFillSentinel = 7;

    // Construct the final array directly using Array.from with a mapping function.
    // This approach avoids the redundant intermediate fill operation seen in some patterns.
    // It initializes each element based on its index relative to the boundary.
    const resultantDataSequence = Array.from({ length: collectionSize }, (_, indexPosition) => {
        // If the current index is less than the specified boundary,
        // it means this position should receive the replacement value.
        if (indexPosition < boundaryIndex) {
            return replacementValue;
        } else {
            // Otherwise, for indices at or beyond the boundary,
            // the default sentinel value is assigned.
            return defaultFillSentinel;
        }
    });

    // Format the resulting array into a single string.
    // Each element is converted to a string and separated by a single space character.
    const finalOutputString = resultantDataSequence.join(" ");

    // Display the generated string to standard output, completing the operation.
    console.log(finalOutputString);

})(); // Execute the defined function immediately to process the input.