const fileSystemHandler = require('fs'); // Import the core file system module.
const standardInputSourcePath = '/dev/stdin'; // Define the path for standard input, typically a pipe or file.

let rawInputContent; // Variable to hold the raw text content read from the input source.

// Utilize a try-catch block for robust file reading operations,
// gracefully handling potential errors like file not found or permission issues.
try {
    rawInputContent = fileSystemHandler.readFileSync(standardInputSourcePath, 'utf8');
} catch (fileReadError) {
    // Log a detailed error message if reading fails and terminate the process.
    console.error('Error encountered while attempting to read from standard input:', fileReadError.message);
    process.exit(1); // Exit with a non-zero status code to indicate an error.
}

// Perform a preliminary check to ensure that some content was actually read.
// If the content is null, undefined, or an empty string, there's nothing to process.
if (!rawInputContent || rawInputContent.trim().length === 0) {
    console.warn("No valid input content was provided for processing.");
    process.exit(0); // Exit with status 0 as there's no data to analyze.
}

// Split the raw input string into an array of lines using the newline character.
// Note: This does not trim individual lines, preserving original string comparison behavior.
let processedDataLines = rawInputContent.split('\n');

// The original problem statement implies that the very first line of input
// (often a count or header) should be disregarded from the lexicographical comparison.
// We explicitly remove it here and store it, even if it's not used further.
const initialDiscardedLine = processedDataLines.shift();

// After discarding the first line, check if there are any lines remaining for comparison.
// If the array is now empty, it means there's no data to find a minimum from.
if (processedDataLines.length === 0) {
    console.log("Insufficient data lines remaining after initial header removal to perform comparison.");
    process.exit(0);
}

// The next available line in the array is designated as our initial candidate
// for the lexicographical minimum string.
let currentLexicographicalSmallest = processedDataLines.shift();

// A further check: if the "initial smallest" itself turned out to be undefined
// (e.g., the file only contained a header and nothing else), we cannot proceed.
if (currentLexicographicalSmallest === undefined) {
    console.log("Could not establish an initial minimum value from the provided input data.");
    process.exit(0);
}

// Iterate through the rest of the lines in the array to find the true
// lexicographical minimum string amongst them.
// The `for...of` loop provides a clean way to iterate over array elements.
for (const lineSegment of processedDataLines) {
    // In JavaScript, the '<' operator performs lexicographical (dictionary-order)
    // comparison when applied to strings.
    const isThisSegmentSmaller = (lineSegment < currentLexicographicalSmallest);

    // If the current line segment is indeed lexicographically smaller than
    // our currently tracked minimum, we update our minimum.
    if (isThisSegmentSmaller) {
        currentLexicographicalSmallest = lineSegment;
    }
    // No 'else' branch is needed as we only care about updating to a smaller value.
}

// Finally, output the determined lexicographical minimum string to standard output.
console.log(currentLexicographicalSmallest);