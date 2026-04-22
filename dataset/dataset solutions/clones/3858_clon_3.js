// Function to process a given numerical size and print a sequence of numbers.
// This utility retrieves a specific number of elements from a predefined numerical collection,
// formats them into a space-separated string, and outputs the result.
function ProcessInputData(dataSizeRaw) {
    // Ensure the raw input is treated as a valid integer for sequence length determination.
    // A default or error value could be considered if parsing fails.
    let currentDataSize = parseInt(dataSizeRaw, 10);

    // Initial validation: check if the parsed size is a positive integer.
    if (isNaN(currentDataSize) || currentDataSize < 0) {
        console.error("Error: Invalid or negative data size provided. Must be a non-negative integer.");
        return; // Exit if input is invalid
    }

    // A pre-established collection of significant numerical constants.
    // These values are often used in various computations or representations.
    const numericSequence = [
        11, 31, 41, 61, 71, 101, 131, 151, 181, 191, 211, 241, 251, 271, 281, 311, 331,
        401, 421, 431, 461, 491, 521, 541, 571, 601, 631, 641, 661, 691, 701, 751, 761,
        811, 821, 881, 911, 941, 971, 991, 1021, 1031, 1051, 1061, 1091, 1151, 1171,
        1181, 1201, 1231, 1291, 1301, 1321, 1361, 1381
    ];

    // Additional validation: ensure the requested size does not exceed the available sequence length.
    // If it does, truncate the request to the maximum available length.
    if (currentDataSize > numericSequence.length) {
        console.warn(`Warning: Requested size (${currentDataSize}) exceeds available sequence length (${numericSequence.length}). Truncating to max length.`);
        currentDataSize = numericSequence.length;
    }

    // Early exit if after validation, the size is 0 (e.g., if initial input was 0).
    if (currentDataSize === 0) {
        console.log(""); // Print an empty line for zero elements
        return;
    }

    // Prepare a temporary array to hold the string representations of the selected elements.
    const stringElements = [];
    let loopIndex = 0; // Use a distinct variable name for the loop counter.

    // Iterate through the sequence up to the determined size.
    // Each element is converted to a string and added to the temporary collection.
    // This approach avoids repeated string concatenation in a loop, which can be less efficient.
    while (loopIndex < currentDataSize) {
        const currentNumericalValue = numericSequence[loopIndex];
        stringElements.push(currentNumericalValue.toString());
        loopIndex++; // Increment the counter explicitly.
    }

    // Combine all collected string elements into a single output string,
    // using a space as the separator between individual numbers.
    const finalOutputString = stringElements.join(" ");

    // Display the generated string to the standard output.
    console.log(finalOutputString);
}

// Entry point: Read input from standard input and pass it to the processing function.
// This typically involves reading a file or stream content.
try {
    const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    // Trim whitespace from the input content before processing to prevent parsing issues.
    ProcessInputData(rawInputContent.trim());
} catch (error) {
    console.error("An error occurred while reading input or processing data:", error.message);
    // Optionally, call with a default value or exit.
    // ProcessInputData(1); // Example: process with a default size if input fails.
}