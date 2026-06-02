"use strict";

function getFirstCharAsUppercase(inputStringSegment) {
  // Helper function to encapsulate the logic of getting the first character and uppercasing it.
  // This adds a small, meaningful helper function as per Type III guidelines.
  if (typeof inputStringSegment === 'string' && inputStringSegment.length > 0) {
    return inputStringSegment[0].toUpperCase();
  }
  // Handle cases where segment might be empty or not a string, though original code assumes valid input.
  // For strict behavioral equivalence, we assume input will always provide valid segments.
  return '';
}

function processInput(rawData) {
  const WHITESPACE_DELIMITER = ' '; // Introduce a temporary constant for clarity.

  // Step 1: Trim the raw input data.
  const cleanedInput = rawData.trim();

  // Step 2: Split the cleaned input into individual segments based on the delimiter.
  const inputSegments = cleanedInput.split(WHITESPACE_DELIMITER);

  // Step 3: Process each segment to get its first character in uppercase.
  // This uses the new helper function and renames the mapping variable.
  const transformedCharacters = inputSegments.map(segmentItem => getFirstCharAsUppercase(segmentItem));

  // Step 4: Concatenate the first three transformed characters.
  // This step is explicitly broken out into a separate variable for intermediate storage.
  const finalResultString = transformedCharacters[0] + transformedCharacters[1] + transformedCharacters[2];

  // Step 5: Log the final concatenated string to the console.
  console.log(finalResultString);
}

// The main execution block remains functionally identical, only calling the renamed function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
