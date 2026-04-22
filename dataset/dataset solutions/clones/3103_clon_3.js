// This module provides a robust function for processing textual data and queries.
// It aims to count occurrences of a specific pattern within defined segments of a main string.

/**
 * Processes a multi-line string input, extracts a main text, and then
 * executes multiple range-based queries to count "AC" pattern occurrences.
 *
 * @param {string} incomingRawDataSet - The entire input as a single string, typically read from a file.
 *                                      Expected format:
 *                                      Line 1: (Ignored, often a count of queries)
 *                                      Line 2: The primary string to be analyzed.
 *                                      Subsequent lines: Query parameters, each containing two space-separated
 *                                                         1-based integer indices (start and end).
 */
function analyzeStringQueries(incomingRawDataSet) {
    // Perform initial validation on the provided input data.
    if (typeof incomingRawDataSet !== 'string' || incomingRawDataSet.trim().length === 0) {
        // If the input is not a string or is empty, log an error and terminate.
        console.error("Error: The input data must be a non-empty string for processing.");
        return; // Exit the function gracefully.
    }

    // Split the input string into an array of individual lines.
    // Use a regular expression to handle both Windows (\r\n) and Unix (\n) newlines.
    // Filter out any lines that are empty or contain only whitespace after splitting.
    const allInputLines = incomingRawDataSet.split(/\r?\n/).filter(lineContent => lineContent.trim() !== '');

    // The first line of competitive programming input often contains metadata (e.g., number of queries).
    // For this problem, it's typically discarded. We explicitly remove it from our lines array.
    const firstLineInfo = allInputLines.shift();
    // We could potentially parse 'firstLineInfo' here if it held meaningful data,
    // but in this context, it's usually just a placeholder.

    // The second line (now the first in 'allInputLines' after the shift) is the main string for analysis.
    const mainTargetString = allInputLines.shift();

    // Crucial check: Ensure we successfully extracted the main string.
    if (!mainTargetString) {
        console.error("Critical Error: Unable to extract the primary target string from the input data.");
        return;
    }

    // Process the remaining lines as query parameters.
    // Each query line is expected to contain two space-separated integers.
    const processedQueryCoordinates = allInputLines.map(queryLineText => {
        // Split the query line by space to get string representations of coordinates.
        const coordinateStrings = queryLineText.split(' ');

        // Validate that we have at least two parts for start and end indices.
        if (coordinateStrings.length < 2) {
            console.warn(`Warning: Malformed query line encountered: "${queryLineText}". Skipping this query.`);
            return null; // Mark as null to be filtered out later.
        }

        // Convert string coordinates to integers using parseInt with radix 10.
        const startIdxOneBased = parseInt(coordinateStrings[0], 10);
        const endIdxOneBased = parseInt(coordinateStrings[1], 10);

        // Validate that the parsed values are indeed numbers.
        if (isNaN(startIdxOneBased) || isNaN(endIdxOneBased)) {
            console.warn(`Warning: Non-numeric coordinates in query line: "${queryLineText}". Skipping.`);
            return null;
        }

        // Return the validated 1-based index pair.
        return [startIdxOneBased, endIdxOneBased];
    }).filter(coordinatePair => coordinatePair !== null); // Remove any null entries resulting from invalid lines.

    // Define the pattern we are searching for.
    const searchPattern = "AC";
    const patternLength = searchPattern.length;

    // Iterate through each valid query coordinate pair.
    for (const currentCoordinateSet of processedQueryCoordinates) {
        const [queryStartOneBased, queryEndOneBased] = currentCoordinateSet;

        // Convert 1-based indices from the problem statement to 0-based indices for JavaScript string methods.
        const segmentStartZeroBased = queryStartOneBased - 1;
        const segmentEndZeroBased = queryEndOneBased; // slice() end is exclusive, so this is correct for 1-based end.

        // Add robust validation for the calculated indices against the main string's bounds.
        if (segmentStartZeroBased < 0 || segmentEndZeroBased > mainTargetString.length || segmentStartZeroBased >= segmentEndZeroBased) {
            console.warn(`Warning: Invalid or out-of-bounds query range [${queryStartOneBased}, ${queryEndOneBased}] ` +
                         `for a string of length ${mainTargetString.length}. Skipping this query.`);
            continue; // Move to the next query if the current one is invalid.
        }

        // Extract the relevant substring segment using `slice()`.
        // `slice()` is generally preferred as it behaves consistently with array `slice()`.
        const currentStringSegment = mainTargetString.slice(segmentStartZeroBased, segmentEndZeroBased);

        // Count occurrences of the "AC" pattern within the extracted segment.
        // This implementation uses a manual loop with `indexOf` for clarity and alternative logic,
        // rather than relying on `split()` which can have performance implications for very large strings.
        let patternOccurrenceCount = 0;
        let lastSearchPosition = 0; // Tracks where to start the next search.

        // Loop until `indexOf` returns -1, indicating no more occurrences.
        while (true) {
            const foundIndex = currentStringSegment.indexOf(searchPattern, lastSearchPosition);

            if (foundIndex === -1) {
                // The pattern was not found from the `lastSearchPosition` onwards.
                break; // Exit the loop.
            }

            // An occurrence was found, increment the counter.
            patternOccurrenceCount++;

            // Update the `lastSearchPosition` to ensure non-overlapping counts.
            // Move past the current occurrence.
            lastSearchPosition = foundIndex + patternLength;
        }

        // Output the final count for the current query.
        console.log(patternOccurrenceCount);
    }
}

// The entry point for the script: Reads input from standard input and calls the analysis function.
// Encapsulate file reading in a try-catch block for robust error handling.
try {
    const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    analyzeStringQueries(standardInputContent);
} catch (fileReadError) {
    // If there's an error reading from stdin (e.g., file not found, permissions), log it.
    console.error(`An error occurred while attempting to read from /dev/stdin: ${fileReadError.message}`);
    // Optionally, exit the process with an error code to indicate failure.
    process.exit(1);
}