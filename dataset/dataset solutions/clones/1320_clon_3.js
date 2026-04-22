// This program is designed to ascertain whether a given string (the second line of input)
// can be obtained by cyclically shifting another string (the first line of input).
// It reads input from standard input, processes it, and then prints 'Yes' or 'No'.

// --- Module Imports and Configuration ---

// Acquire the 'fs' (file system) module, which is essential for reading files,
// including standard input streams in Node.js environments.
const fileSystemUtility = require("fs");

// Define the absolute path to the standard input stream.
// On Unix-like operating systems, this is typically '/dev/stdin'.
const standardInFileLocation = "/dev/stdin";

// --- Input Processing Phase ---

// Read the entire content available from the standard input stream synchronously.
// The data is decoded using UTF-8 encoding.
// Any leading or trailing whitespace characters are meticulously removed from the buffer.
// Finally, the consolidated string content is segmented into an array of individual lines,
// with each element representing a line delimited by a newline character.
const rawInputLines = fileSystemUtility
  .readFileSync(standardInFileLocation, "utf8") // Read content as a UTF-8 string
  .trim()                                      // Strip whitespace from both ends
  .split('\n');                                // Break string into an array of lines

// --- Pre-computation and Validation ---

// Implement a crucial validation step: ensure that the input provided
// contains at least two distinct lines. The algorithm requires a base string
// and a potential rotational candidate string.
if (rawInputLines.length < 2) {
  // If the input does not meet the minimum requirement, an error message
  // is logged to the standard error stream, and the program is terminated
  // with a non-zero exit code, signaling an abnormal exit.
  console.error("Input Error: Expected at least two lines for comparison. Exiting.");
  process.exit(1); // Indicate failure
}

// Extract the primary string from the first line of the processed input.
// This string will be used as the base for cyclic rotation checks.
const primaryStringForRotation = rawInputLines[0];

// Extract the secondary string from the second line of the processed input.
// This string is the candidate that we will check to see if it's a rotation
// of the primary string.
const candidateStringForCheck = rawInputLines[1];

// --- Core Logic for Rotational Equivalence ---

// To effectively determine if 'candidateStringForCheck' is a cyclic shift of
// 'primaryStringForRotation', we construct a new string by concatenating
// 'primaryStringForRotation' with itself. For instance, if the primary string is "abcd",
// this new string becomes "abcdabcd". Any cyclic permutation of "abcd" (e.g., "bcda", "cdab", "dabc")
// will inherently exist as a substring within "abcdabcd".
const extendedSearchSpace = primaryStringForRotation.repeat(2);

// Utilize the String.prototype.includes() method to perform an efficient substring search.
// This method returns a boolean value: 'true' if 'candidateStringForCheck' is found
// within 'extendedSearchSpace', and 'false' otherwise.
const isCyclicRotationFound = extendedSearchSpace.includes(candidateStringForCheck);

// --- Result Output Phase ---

// Based on the outcome of the cyclic rotation check, print the corresponding result.
if (isCyclicRotationFound) {
  // If the candidate string is indeed a cyclic rotation of the primary string.
  console.log('Yes');
} else {
  // If the candidate string is not a cyclic rotation.
  console.log('No');
}

// Program execution concludes successfully.