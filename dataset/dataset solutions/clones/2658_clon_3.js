(function(sourceData) {
  // This program processes numerical input to generate a sequence within a specified range.

  // Helper function to parse and validate numeric input.
  const extractNumericValues = (rawText) => {
    if (!rawText || typeof rawText !== 'string') {
      console.error("Error: Invalid or empty input provided.");
      return []; // Return an empty array on invalid input
    }
    // Trim whitespace, split by any whitespace, filter out empty strings, and convert to numbers.
    const numericTokens = rawText.trim().split(/\s+/).filter(token => token !== '');
    if (numericTokens.length < 2) {
      console.error("Error: Not enough numeric values found in input.");
      return [];
    }
    // Explicitly convert to integer.
    return numericTokens.map(val => parseInt(val, 10));
  };

  // Process the raw input string.
  let processedNumbers = extractNumericValues(sourceData);

  // Guard clause: Check if parsing was successful and we have enough numbers.
  if (processedNumbers.length < 2 || isNaN(processedNumbers[0]) || isNaN(processedNumbers[1])) {
    console.error("Fatal Error: Could not obtain valid numeric parameters from input. Exiting.");
    return; // Terminate execution if input is invalid.
  }

  // Rename variables for clarity and apply Type II change.
  const rangeParameter = processedNumbers[0]; // Corresponds to original 'K'
  const centralPoint = processedNumbers[1];   // Corresponds to original 'X'

  // Introduce helper variables for range boundaries.
  const lowerBound = centralPoint - rangeParameter + 1;
  const upperBound = centralPoint + rangeParameter - 1;

  // Collection to store the generated sequence.
  const resultSequence = [];

  // Generate the sequence using a different loop structure (while loop).
  let currentElement = lowerBound;
  while (currentElement <= upperBound) {
    resultSequence.push(currentElement);
    currentElement++; // Increment to the next number in the sequence.
  }

  // Helper function to format and output the result.
  const presentOutput = (sequenceToDisplay) => {
    if (sequenceToDisplay.length === 0) {
      console.log("No sequence generated."); // Handle empty sequence case
      return;
    }
    // Join the numbers with a space and print.
    console.log(sequenceToDisplay.join(' '));
  };

  // Display the final sequence.
  presentOutput(resultSequence);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));