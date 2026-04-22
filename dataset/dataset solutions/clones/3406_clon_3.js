// This module is designed to process a stream of raw numerical data,
// performing a series of transformations and aggregations to derive a final result.
// It expects input where the first line may represent metadata or a count,
// followed by a list of numerical entries.
function analyzeNumericStream(rawDataPayload) {
    // A temporary collection to store numbers after initial parsing.
    let collectionOfParsedNumbers = [];

    // Begin by splitting the incoming raw string data into individual lines.
    // Each line is then processed to extract a valid numerical value.
    const individualLines = rawDataPayload.split('\n');
    let lineCounter = 0; // Keep track of line numbers for potential debugging/error reporting.

    // Iterate over each line to perform rigorous parsing and validation.
    for (const currentLineContent of individualLines) {
        lineCounter++;
        const trimmedContent = currentLineContent.trim(); // Sanitize whitespace from the line.

        // Skip lines that are empty after trimming, as they contain no data.
        if (trimmedContent.length === 0) {
            continue;
        }

        // Attempt to convert the string content into a floating-point number.
        const numericalConversionResult = Number(trimmedContent);

        // Validate if the conversion yielded a valid, finite number.
        // This guards against `NaN` (Not-a-Number) and `Infinity` values.
        if (isNaN(numericalConversionResult) || !Number.isFinite(numericalConversionResult)) {
            // Log a warning for non-numeric or invalid lines, but continue processing.
            process.stderr.write(`Warning: Skipping invalid data entry on line ${lineCounter}: '${trimmedContent}'\n`);
            continue;
        }

        // If validation passes, add the successfully parsed number to our collection.
        collectionOfParsedNumbers.push(numericalConversionResult);
    }

    // Essential guard clause: If no valid numbers were found after parsing,
    // there's nothing further to process. Output an error and terminate.
    if (collectionOfParsedNumbers.length === 0) {
        process.stderr.write("Error: No valid numerical entries were detected in the input stream.\n");
        process.stdout.write("0\n"); // Output a default aggregate value of zero.
        return; // Exit the function gracefully.
    }

    // The first element in the collection is often a header or count.
    // Per the processing logic, we remove and ignore this initial value.
    // Ensure the collection is not empty before attempting to remove an element.
    if (collectionOfParsedNumbers.length > 0) {
        const discardedHeader = collectionOfParsedNumbers.shift();
        // console.log(`Debug: The initial header value '${discardedHeader}' was removed.`);
    } else {
        // This case should ideally be caught by the previous `collectionOfParsedNumbers.length === 0` check,
        // but serves as an additional safeguard if logic were to change.
        process.stderr.write("Warning: No data elements remained after header-like processing.\n");
        process.stdout.write("0\n");
        return;
    }

    // Another critical check: After discarding the header, is there any data left?
    if (collectionOfParsedNumbers.length === 0) {
        process.stderr.write("Error: After initial processing, no data elements are available for calculation.\n");
        process.stdout.write("0\n"); // Output zero as the sum if the list is empty.
        return;
    }

    // Identify the absolute highest numerical value present in the remaining dataset.
    // The spread operator (`...`) provides a clean way to pass array elements as arguments.
    const absoluteHighestValue = Math.max(...collectionOfParsedNumbers);

    // Now, we need to find the specific position (index) of this highest value.
    // We'll iterate through the array to find the first occurrence.
    let firstOccurrenceIndex = -1; // Initialize with an invalid index.
    let currentScanIndex = 0; // Helper for manual iteration.
    while (currentScanIndex < collectionOfParsedNumbers.length) {
        if (collectionOfParsedNumbers[currentScanIndex] === absoluteHighestValue) {
            firstOccurrenceIndex = currentScanIndex;
            break; // Found it, no need to search further.
        }
        currentScanIndex++;
    }

    // A final validation: Ensure the index of the highest value was successfully found.
    // This scenario is unlikely if the array is not empty, but robustness demands it.
    if (firstOccurrenceIndex === -1) {
        process.stderr.write("Critical Error: Failed to locate the index of the highest value. Data integrity issue.\n");
        // Decide on fallback behavior: either exit, or proceed without modification.
        // For this clone, we'll proceed as if no modification occurred to avoid crashing.
    } else {
        // Perform the core transformation: halve the highest element found at its index.
        // Explicitly using `2.0` ensures float division, aligning with typical JS behavior.
        collectionOfParsedNumbers[firstOccurrenceIndex] = collectionOfParsedNumbers[firstOccurrenceIndex] / 2.0;
    }

    // Calculate the grand total of all numbers in the collection after modifications.
    // A traditional `for...of` loop is used here as an alternative to `reduce` for diversity.
    let grandCumulativeTotal = 0.0; // Initialize as a float for precision.
    for (const numberEntry of collectionOfParsedNumbers) {
        grandCumulativeTotal += numberEntry;
    }

    // Output the final computed aggregate value to standard output.
    // The result is converted to a string and appended with a newline character.
    process.stdout.write(String(grandCumulativeTotal) + '\n');
}

// The primary entry point for script execution.
// This block reads content from standard input, typically a piped file.
try {
    // Synchronously read the entire content of standard input, interpreted as UTF-8 text.
    const rawInputContentFromStdin = require('fs').readFileSync('/dev/stdin', 'utf8');
    // Invoke our main processing function with the obtained raw data.
    analyzeNumericStream(rawInputContentFromStdin);
} catch (executionError) {
    // Catch any exceptions that occur during file reading or the initial setup.
    process.stderr.write(`An unexpected system error occurred: ${executionError.message}\n`);
    // Terminate the process with an error code to signal failure.
    process.exit(1);
}