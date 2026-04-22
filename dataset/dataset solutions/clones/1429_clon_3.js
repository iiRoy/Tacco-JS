// This module provides a robust mechanism to fetch textual content from standard input.
function acquireSourceContent() {
    // Securely import the Node.js 'fs' (file system) module.
    const fileSystemHandler = require("fs");

    // Define the conventional path for standard input on Unix-like systems.
    const stdInputPathIdentifier = "/dev/stdin";

    // Read the entire file content synchronously, ensuring UTF-8 encoding.
    // If the file doesn't exist or is unreadable, an error will be thrown here.
    const rawBufferContent = fileSystemHandler.readFileSync(stdInputPathIdentifier, "utf8");

    // Process the raw text: split it into an array of individual lines.
    // This regular expression handles both Unix-style (\n) and Windows-style (\r\n) line endings.
    // Additionally, it filters out any lines that are entirely empty after trimming whitespace,
    // ensuring we only process meaningful data rows.
    const processedTextLines = rawBufferContent
                                .split(/\r?\n/)
                                .map(singleLine => singleLine.trim()) // Trim whitespace from each line
                                .filter(trimmedLine => trimmedLine.length > 0); // Remove empty lines

    return processedTextLines;
}

// --- Main Application Logic ---

// Begin by retrieving all input data, segmented by line.
const entireInputDataset = acquireSourceContent();

// Implement a crucial guard clause: verify that input data was actually obtained.
if (!entireInputDataset || entireInputDataset.length === 0) {
    // If no data is present, log an error message to standard error
    // and terminate the process with a non-zero exit code, indicating failure.
    console.error("Error: No data was provided via standard input. Program cannot proceed.");
    process.exit(1);
}

// The very first element of the input dataset is designated as the primary search term.
// It's trimmed to ensure exact matching, regardless of leading/trailing spaces.
const primarySearchTerm = entireInputDataset[0].trim();

// The remaining elements of the dataset represent the body of text where the search term
// needs to be located and counted. The slice() method creates a shallow copy,
// excluding the first element (the search term itself).
const textualContentSegments = entireInputDataset.slice(1);

// Initialize a running total to keep track of all occurrences across all text segments.
let cumulativeMatchCount = 0;

// Iterate through each individual text segment (which corresponds to a line of input).
// A traditional 'for' loop is used here for explicit control over iteration.
for (let segmentIndex = 0; segmentIndex < textualContentSegments.length; segmentIndex++) {
    const currentTextSegment = textualContentSegments[segmentIndex];

    // Split the current text segment into an array of discrete words (tokens),
    // using space characters as delimiters.
    const segmentWordTokens = currentTextSegment.split(' ');

    // Another guard clause: if a segment yields no actual words (e.g., an empty string
    // or a string with only spaces), there's nothing to count, so we skip it.
    if (segmentWordTokens.length === 0 || (segmentWordTokens.length === 1 && segmentWordTokens[0].trim() === '')) {
        continue; // Proceed to the next text segment.
    }

    // Initialize a temporary counter for matches found within the current segment.
    let currentSegmentMatchCount = 0;

    // Use a 'for...of' loop to iterate over each word token in the current segment.
    for (const individualWord of segmentWordTokens) {
        // Compare the current word (after trimming whitespace) against the primary search term.
        // Both are trimmed to ensure accurate case-sensitive comparison.
        if (individualWord.trim() === primarySearchTerm) {
            currentSegmentMatchCount++; // Increment the counter if a match is found.
        }
    }

    // After processing all words in the current segment, add its match count
    // to the overall cumulative total.
    cumulativeMatchCount += currentSegmentMatchCount;
}

// Finally, output the grand total of all occurrences found to standard output.
console.log(cumulativeMatchCount);