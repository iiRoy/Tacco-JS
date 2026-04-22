const fileSystemOperations = require('node:fs'); // Importing the file system module for input handling.

// Define the path to the standard input stream.
const standardInputPath = '/dev/stdin';

// Read the entire content of the standard input as a UTF-8 string.
const rawInputBuffer = fileSystemOperations.readFileSync(standardInputPath, { encoding: 'utf8', flag: 'r' });

// Process the raw input: remove any leading or trailing whitespace.
const processedTextContent = rawInputBuffer.trim();

// Initialize a variable to store the greatest length of a valid 'JOI' sequence found.
// This will hold the maximum number of 'O's in a qualifying J...O...I sequence.
let greatestMatchLength = 0;

// Define the regular expression pattern to find sequences of 'J's, 'O's, and 'I's.
// The 'g' flag ensures that all occurrences are matched, not just the first.
const joiSequencePattern = /(J+)(O+)(I+)/g;

// Helper function to determine the valid length of a 'JOI' sequence.
// A sequence is valid if the number of 'J's and 'I's are both greater than or equal to the number of 'O's.
const determineValidSegmentLength = (countJ, countO, countI) => {
  // If the conditions for a valid JOI sequence are met, return the count of 'O's.
  // Otherwise, this particular segment does not contribute to the maximum, so return 0.
  if (countJ >= countO && countI >= countO) {
    return countO;
  }
  return 0;
};

// Guard clause: If the processed content is empty, there are no matches, so output 0 and exit.
if (!processedTextContent || processedTextContent.length === 0) {
  console.log(0);
  process.exit(0);
}

// Use `matchAll` to iterate over all non-overlapping matches of the pattern in the processed text.
// `matchAll` returns an iterator of match objects.
const allFoundSequences = processedTextContent.matchAll(joiSequencePattern);

// Loop through each match object found by the regex.
for (const currentMatchSegment of allFoundSequences) {
  // Extract the lengths of the captured groups:
  // currentMatchSegment[1] is the sequence of 'J's.
  // currentMatchSegment[2] is the sequence of 'O's.
  // currentMatchSegment[3] is the sequence of 'I's.
  const lengthOfJs = currentMatchSegment[1].length;
  const lengthOfOs = currentMatchSegment[2].length;
  const lengthOfIs = currentMatchSegment[3].length;

  // Calculate the potential length for the current sequence using the helper function.
  const potentialLengthForCurrentMatch = determineValidSegmentLength(lengthOfJs, lengthOfOs, lengthOfIs);

  // Update the overall greatest match length if the current potential length is higher.
  greatestMatchLength = Math.max(greatestMatchLength, potentialLengthForCurrentMatch);
}

// Output the final maximum length found to the console.
console.log(greatestMatchLength);