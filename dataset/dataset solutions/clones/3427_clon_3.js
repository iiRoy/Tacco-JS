// Define key configuration parameters as constants for clarity and maintainability.
const FILE_INPUT_PATH = "/dev/stdin";
const INPUT_FILE_ENCODING = "utf8";
const TARGET_NUMERIC_COMPARISON_VALUE = 753;
const SEGMENT_LENGTH_TO_EXTRACT = 3;

// Import the Node.js file system module for input/output operations.
const fileSystemHandler = require("fs");

let inputCharacterStream; // This variable will store the content read from the standard input.

try {
  // Attempt to read the entire content of the specified input file synchronously.
  // This approach is straightforward for single-file processing in scripting contexts.
  inputCharacterStream = fileSystemHandler.readFileSync(FILE_INPUT_PATH, INPUT_FILE_ENCODING);
} catch (fileReadError) {
  // If an error occurs during file reading (e.g., file not found, permissions issue),
  // log the error and terminate the process gracefully.
  console.error("Failed to acquire input data from source:", fileReadError.message);
  process.exit(1); // Indicate an abnormal termination.
}

// Perform a type check to ensure the read content is indeed a string, as expected.
// While readFileSync with 'utf8' usually guarantees a string, defensive programming is good.
if (typeof inputCharacterStream !== 'string') {
    console.error("Acquired input content is not in expected string format.");
    process.exit(1);
}

// Determine the total length of the input string for boundary checks.
const totalStreamLength = inputCharacterStream.length;

// Initialize a variable to track the smallest absolute difference found.
// Start with the maximum possible safe integer to ensure any valid difference will be smaller.
let currentMinimumAbsoluteDifference = Number.MAX_SAFE_INTEGER;

// Implement a pre-check: if the input string is shorter than the segment length,
// no valid segments can be formed. The original code would result in Infinity in this case.
if (totalStreamLength < SEGMENT_LENGTH_TO_EXTRACT) {
    console.log(Infinity); // Output Infinity, consistent with Math.min on an empty set.
    process.exit(0); // Exit successfully as the condition has been handled.
}

// Iterate through the input stream to extract and process all possible segments.
// The loop condition ensures that 'currentSegmentStartIndex + SEGMENT_LENGTH_TO_EXTRACT'
// does not exceed 'totalStreamLength', preventing out-of-bounds access.
for (let currentSegmentStartIndex = 0;
     currentSegmentStartIndex <= totalStreamLength - SEGMENT_LENGTH_TO_EXTRACT;
     currentSegmentStartIndex++) {

    // Extract a substring of the predefined length starting from the current index.
    const extractedSegment = inputCharacterStream.substring(
        currentSegmentStartIndex,
        currentSegmentStartIndex + SEGMENT_LENGTH_TO_EXTRACT
    );

    // Attempt to convert the extracted segment into a base-10 integer.
    // parseInt is more explicit than bitwise OR for numeric conversion.
    const parsedNumericalSegment = Number.parseInt(extractedSegment, 10);

    let effectiveNumericalValue;
    // The original code used `|0`, which converts non-numeric strings to 0.
    // We replicate this behavior: if parsing results in NaN, use 0 instead.
    if (Number.isNaN(parsedNumericalSegment)) {
        effectiveNumericalValue = 0;
    } else {
        effectiveNumericalValue = parsedNumericalSegment;
    }

    // Calculate the absolute difference between the parsed segment value and the target value.
    const segmentDifference = Math.abs(effectiveNumericalValue - TARGET_NUMERIC_COMPARISON_VALUE);

    // Update the minimum difference if the current segment's difference is smaller.
    if (segmentDifference < currentMinimumAbsoluteDifference) {
        currentMinimumAbsoluteDifference = segmentDifference;
    }
}

// Display the final computed minimum absolute difference to standard output.
console.log(currentMinimumAbsoluteDifference);