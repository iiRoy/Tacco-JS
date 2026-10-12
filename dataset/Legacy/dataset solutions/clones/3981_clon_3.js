"use strict";

// Define a constant for the non-digit regular expression delimiter.
const NON_DIGIT_DELIMITER = /\D/;

// A utility function to split a given string line into parts using the predefined delimiter.
const parseLineSegments = (lineContent) => {
  return lineContent.split(NON_DIGIT_DELIMITER);
};

// The main processing function for the input data.
const processRawInput = (fullInputData) => {
  // Log the entire raw input data as the first observable action.
  console.log(fullInputData);

  // Trim any leading/trailing whitespace from the input and then split it into individual lines.
  const cleanedInput = fullInputData.trim();
  const inputLineCollection = cleanedInput.split('\n');

  // Process each of the first three lines to extract their numerical segments.
  const firstLineSegments = parseLineSegments(inputLineCollection[0]);
  const secondLineSegments = parseLineSegments(inputLineCollection[1]);
  const thirdLineSegments = parseLineSegments(inputLineCollection[2]);

  // Extract the specific required elements from the processed segments.
  // The first element from the first line.
  const extractedFirstValue = firstLineSegments[0];
  // The second element from the second line.
  const extractedSecondValue = secondLineSegments[1];
  // The third element from the third line.
  const extractedThirdValue = thirdLineSegments[2];

  // Concatenate the extracted values to form the final output string.
  const finalConcatenatedResult = `${extractedFirstValue}${extractedSecondValue}${extractedThirdValue}`;

  // Log the final result string as the second observable action.
  console.log(finalConcatenatedResult);
};

// Read the input from standard input and pass it to the processing function.
processRawInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
