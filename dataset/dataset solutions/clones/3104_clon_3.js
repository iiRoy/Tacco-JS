function SolutionProcessor(sourceTextContent) {
    // Check if the input content is valid before processing.
    if (!sourceTextContent || typeof sourceTextContent !== 'string' || sourceTextContent.trim() === '') {
        console.error("Error: Input content is empty or invalid.");
        return; // Exit if no valid input
    }

    // Split the entire input content into individual lines.
    const parsedLines = sourceTextContent.split("\n");

    // Ensure there are enough lines for the primary data and at least one query.
    if (parsedLines.length < 3) {
        console.error("Error: Insufficient lines in input for primary data and queries.");
        return;
    }

    // The second line (index 1) contains the main sequence string.
    const primaryDataSequence = parsedLines[1];
    // The subsequent lines (from index 2 onwards) are the query instructions.
    const operationRequests = parsedLines.slice(2);

    // Constant for the pattern we are searching for.
    const SEARCH_TARGET = 'AC';

    // Iterate through each operation request to perform the required analysis.
    for (const currentRequestLine of operationRequests) {
        // Skip empty lines that might appear due to trailing newlines or malformed input.
        if (currentRequestLine.trim() === '') {
            continue;
        }

        // Split the request line by space to get the index parameters.
        const coordinateStrings = currentRequestLine.split(" ");

        // Validate that we received exactly two index parameters.
        if (coordinateStrings.length !== 2) {
            console.error(`Warning: Malformed query line "${currentRequestLine}". Skipping.`);
            continue;
        }

        // Parse the start and end indices from their string representations.
        // Use parseInt with radix 10 for explicit base.
        const rawStartIndex = parseInt(coordinateStrings[0], 10);
        const rawEndIndex = parseInt(coordinateStrings[1], 10);

        // Validate that the parsed indices are indeed numbers.
        if (isNaN(rawStartIndex) || isNaN(rawEndIndex)) {
            console.error(`Warning: Non-numeric indices found in query "${currentRequestLine}". Skipping.`);
            continue;
        }

        // Adjust the start index to be 0-based for JavaScript string slicing,
        // as the problem often uses 1-based indexing.
        const adjustedStartPos = rawStartIndex - 1;
        const actualEndPos = rawEndIndex; // The slice end index is exclusive, so this works directly.

        // Perform boundary checks for the extracted segment.
        if (adjustedStartPos < 0 || actualEndPos > primaryDataSequence.length || adjustedStartPos >= actualEndPos) {
            console.error(`Warning: Invalid index range [${rawStartIndex}, ${rawEndIndex}] for sequence length ${primaryDataSequence.length}. Skipping.`);
            continue;
        }

        // Extract the substring based on the adjusted indices.
        const extractedSegment = primaryDataSequence.slice(adjustedStartPos, actualEndPos);

        // Initialize a counter for the occurrences of the target pattern.
        let occurrenceCount = 0;
        let searchPosition = 0; // Starting position for the search within the segment.

        // Count occurrences of the SEARCH_TARGET using a loop with indexOf.
        // This is an alternative to the split-and-count method.
        while ((searchPosition = extractedSegment.indexOf(SEARCH_TARGET, searchPosition)) !== -1) {
            occurrenceCount++;
            // Advance the search position past the found target to avoid recounting.
            searchPosition += SEARCH_TARGET.length;
        }

        // Output the final count for the current query.
        console.log(occurrenceCount);
    }
}

// Entry point: Read input from standard input and pass it to the processor.
// This part ensures compatibility with typical competitive programming environments.
const inputFromStandardIn = require("fs").readFileSync("/dev/stdin", "utf8");
SolutionProcessor(inputFromStandardIn);