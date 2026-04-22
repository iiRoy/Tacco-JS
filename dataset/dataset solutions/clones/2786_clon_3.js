'use strict';

// This function processes raw string input to calculate a specific numerical difference.
// It includes extensive validation and intermediate steps to enhance robustness and readability.
function calculateMiddleElementDifference(rawInputPayload) {
  // Type III: Initial input validation as a guard clause
  if (typeof rawInputPayload !== 'string' || rawInputPayload.length === 0) {
    console.error("Processing Error: The provided input payload is empty or not a valid string.");
    return null; // Indicate failure
  }

  // Type II: Renaming 'input' variable and breaking down chained operations
  // Type III: Adding comments for clarity
  const cleanedPayload = rawInputPayload.trim(); // Remove leading/trailing whitespace
  const contentLines = cleanedPayload.split(/\n/); // Divide the payload into an array of lines

  // Type III: Validate the minimum number of expected lines
  if (contentLines.length < 2) {
    console.error("Processing Error: Insufficient data lines. Expected at least two lines of input.");
    return null;
  }

  // Type II: Renaming 'N' to 'expectedElementCount'
  // Type III: Explicitly using parseInt for robust string-to-number conversion with radix
  const expectedElementCount = parseInt(contentLines[0], 10);

  // Type III: Validate the parsed element count
  if (isNaN(expectedElementCount) || expectedElementCount <= 0) {
    console.error("Processing Error: The first line does not contain a valid positive number for element count.");
    return null;
  }

  // Type III: Enforcing an even count, as implied by the original indexing (N/2, N/2-1)
  if (expectedElementCount % 2 !== 0) {
    console.error("Processing Error: The element count must be an even number for this specific calculation method.");
    return null;
  }

  // Type II: Renaming 'd' related variables
  // Type III: Breaking down the sequence processing, adding filtering for robustness
  const rawNumberStrings = contentLines[1].split(/\s+/); // Split the second line by one or more spaces

  // Type III: Filter out any empty strings that might result from multiple spaces
  const filteredNumberStrings = rawNumberStrings.filter(s => s.length > 0);

  // Type III: Validate that the number of parsed strings matches the expected count
  if (filteredNumberStrings.length !== expectedElementCount) {
      console.error(`Processing Error: Mismatch in element count. Expected ${expectedElementCount}, but found ${filteredNumberStrings.length} numbers.`);
      return null;
  }

  // Type III: Define a helper function for parsing individual numbers
  const parseNumericString = (currentStringValue) => {
    const parsedNumber = parseInt(currentStringValue, 10);
    if (isNaN(parsedNumber)) {
      console.error(`Parsing Warning: Could not convert '${currentStringValue}' to a number. It will be treated as NaN.`);
    }
    return parsedNumber;
  };

  // Type III: Map string values to numbers using the helper function
  const numericalValuesArray = filteredNumberStrings.map(parseNumericString);

  // Type III: Check if any parsing failed (resulted in NaN)
  if (numericalValuesArray.some(Number.isNaN)) {
    console.error("Processing Error: One or more values in the numeric sequence could not be successfully parsed.");
    return null;
  }

  // Type II: More descriptive variable names for sort comparison
  // Type III: Adding a comment to explain the sorting logic
  const sortedNumericalSequence = numericalValuesArray.sort((firstItem, secondItem) => {
    // Standard ascending numerical sort
    return firstItem - secondItem;
  });

  // Type III: Final check on the sorted array's integrity
  if (sortedNumericalSequence.length !== expectedElementCount) {
      console.error("Processing Error: The final sorted sequence length does not match the expected count.");
      return null;
  }

  // Type III: Introduce helper variables for index calculation to improve readability
  // These indices point to the two middle elements when the count is even.
  const rightMiddleIndex = expectedElementCount / 2;
  const leftMiddleIndex = rightMiddleIndex - 1;

  // Type III: Validate computed indices are within bounds
  if (leftMiddleIndex < 0 || rightMiddleIndex >= sortedNumericalSequence.length) {
      console.error("Processing Error: Calculated indices for middle elements are out of bounds for the sorted array.");
      return null;
  }

  // Type III: Extract elements into named variables for clarity
  const valueAtRightMiddle = sortedNumericalSequence[rightMiddleIndex];
  const valueAtLeftMiddle = sortedNumericalSequence[leftMiddleIndex];

  // Type III: Store the final computation result in a dedicated variable
  const computedDifference = valueAtRightMiddle - valueAtLeftMiddle;

  return computedDifference;
}

// Type III: Use a try-catch block to handle potential file system errors
try {
  // Type II: Renaming variable for file content
  const fileSystemData = require('fs').readFileSync('/dev/stdin', 'utf8');

  // Type III: Call the main processing function and store its outcome
  const finalOutcome = calculateMiddleElementDifference(fileSystemData);

  // Type III: Conditionally log the result based on whether the processing was successful
  if (finalOutcome !== null) {
    console.log(finalOutcome);
  } else {
    // An error message would have been printed by calculateMiddleElementDifference
    // No additional logging here, as the specific error is already reported.
  }
} catch (ioError) {
  // Type III: Specific error handling for the file reading operation
  console.error("Input/Output Error: Failed to read data from /dev/stdin. Details:", ioError.message);
  // Optionally, a process exit code could be set here for script termination status.
  // process.exit(1);
}