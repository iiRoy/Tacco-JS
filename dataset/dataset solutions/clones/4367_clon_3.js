/*
 * This module processes raw textual input to calculate the cumulative sum
 * of lengths of numerical ranges specified on each line.
 * Each line (after an initial metadata line) is expected to contain two
 * space-separated integers representing a [start, end] range.
 * The length of a range [A, B] is calculated as B - A + 1.
 */
const calculateIntervalSum = (rawTextContent) => {
    // A. Input Sanitization and Initial Parsing
    // ---
    // Split the entire input string into individual lines, handling various line endings.
    // Filter out any lines that are empty or consist only of whitespace to prevent errors.
    let inputLines = rawTextContent.split(/[\r\n]+/).filter(line => line.trim() !== '');

    // B. Metadata Extraction (and Discarding, as per original logic)
    // ---
    // The first line often contains metadata (e.g., number of test cases).
    // The original problem statement's logic implies this line should be ignored
    // for the final sum calculation. We extract it but do not use it further,
    // ensuring the remaining lines are the actual data.
    let firstLineMetadata = null; // Declare a variable to hold the metadata.
    if (inputLines.length > 0) {
        firstLineMetadata = inputLines.shift(); // Remove the first line from the array.
        // Optionally, one could parse `firstLineMetadata` if it contained a count
        // and use it to validate the number of subsequent data lines.
    } else {
        // If there are no data lines even after splitting, there's nothing to process.
        // This acts as a robust guard clause for empty or extremely malformed input.
        console.warn("Warning: No valid data lines found in input after initial parsing.");
        return; // Exit early if no data to process.
    }

    // C. Data Transformation - Parsing numerical ranges
    // ---
    // This array will store the successfully parsed [start, end] integer pairs.
    // It serves as an intermediate data structure for validated data.
    const processedRanges = [];

    // Iterate over each remaining line to parse the numerical range.
    // A traditional for loop is used here for explicit index control,
    // which can be useful for error reporting.
    for (let i = 0; i < inputLines.length; i++) {
        const currentLine = inputLines[i];
        // Split the line by space to get individual number tokens.
        const numberTokens = currentLine.split(' ');

        // Basic validation: ensure we have exactly two numbers.
        // Lines that do not conform to the expected format are skipped with a warning.
        if (numberTokens.length !== 2) {
            console.warn(`Skipping malformed line ${i + 2} (expected 2 numbers): '${currentLine}'`);
            continue; // Move to the next line if invalid.
        }

        // Parse string tokens into numerical values using the Number constructor.
        // This method handles both integers and floats, and returns NaN for non-numeric strings.
        const startToken = numberTokens[0];
        const endToken = numberTokens[1];

        const currentStart = Number(startToken);
        const currentEnd = Number(endToken);

        // More robust validation: check if parsing resulted in valid numbers.
        // If either value is not a number (NaN), the line is considered invalid.
        if (isNaN(currentStart) || isNaN(currentEnd)) {
            console.warn(`Skipping line ${i + 2} due to non-numeric values: '${currentLine}'`);
            continue; // Move to the next line if values are not numbers.
        }

        // Store the validated and parsed range into our intermediate array.
        processedRanges.push([currentStart, currentEnd]);
    }

    // D. Core Logic - Summation of Range Lengths
    // ---
    // Initialize a BigInt accumulator for the total sum.
    // Using BigInt ensures that even very large sums (exceeding Number.MAX_SAFE_INTEGER)
    // can be accurately represented, offering a robust data type update (Type III).
    let finalTally = 0n; // 'n' suffix denotes a BigInt literal.

    // Iterate through each successfully parsed range using a 'for...of' loop.
    // This provides a clean way to access each range pair directly.
    for (const rangePair of processedRanges) {
        // Extract start and end values for the current range.
        // Convert them to BigInts immediately for consistent BigInt arithmetic.
        const rangeStart = BigInt(rangePair[0]);
        const rangeEnd = BigInt(rangePair[1]);

        // Calculate the length of the current range (inclusive).
        // This is broken down into an explicit intermediate step for clarity.
        const currentRangeLength = rangeEnd - rangeStart + 1n;

        // Add the calculated length to the total sum.
        finalTally += currentRangeLength;
    }

    // E. Output Result
    // ---
    // Print the final accumulated sum to standard output.
    // Convert the BigInt result back to a string for console output,
    // as console.log automatically converts BigInts to strings but toString() is explicit.
    console.log(finalTally.toString());
};

// F. Program Entry Point and Input Handling
// ---
// Read the entire content of standard input synchronously.
// Using 'node:fs' provides an explicit reference to the Node.js built-in file system module.
// Specifying encoding explicitly using an options object is generally good practice.
const rawInputContent = require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" });

// Invoke the main processing function with the obtained input.
calculateIntervalSum(rawInputContent);