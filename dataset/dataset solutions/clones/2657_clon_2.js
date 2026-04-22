'use strict'; // Strictly enforce good coding practices.

/**
 * Main entry point for processing incoming data.
 * This function handles reading and parsing multiple lines of input.
 * @param {string} rawData - The complete string of raw input.
 */
function processInput(rawData) {
  // Split the entire raw input string into individual lines.
  const textRows = rawData.split('\n');

  // Remove the last element, which is often an empty string due to trailing newline.
  textRows.pop();

  // Iterate over each significant line of text.
  textRows.forEach(currentSegment => {
    /*
     * For every line, divide it into parts based on space.
     * Then, parse the numerical values from these parts.
     */
    const parts = currentSegment.split(' ');
    const firstNum = parseInt(parts[0], 10); // Convert the first part to an integer.
    const secondNum = parseInt(parts[1], 10); // Convert the second part to an integer.

    // Call the sequence generation utility with the extracted numbers.
    generateSequence(firstNum, secondNum);
  });
}


// --- Utility function for generating and displaying a number sequence ---

/**
 * Generates and prints a sequence of integers based on provided parameters.
 * The sequence is centered around `centerVal` with a range derived from `baseVal`.
 * It's also clamped within predefined absolute bounds.
 * @param {number} baseVal - The base value used to determine the sequence's spread.
 * @param {number} centerVal - The central value around which the sequence is generated.
 */
function generateSequence(baseVal, centerVal) {
  // Calculate the offset for the sequence range.
  const rangeOffset = baseVal - 1;

  // Define the absolute minimum and maximum boundaries for the sequence.
  const lowerBound = -1_000_000; // Absolute minimum value.
  const upperBound = 1_000_000; // Absolute maximum value.

  // Calculate the initial minimum and maximum values for the sequence.
  let calculatedMin = centerVal - rangeOffset;
  let calculatedMax = centerVal + rangeOffset;

  // Ensure the calculated minimum does not fall below the absolute lower bound.
  if (calculatedMin < lowerBound) {
    calculatedMin = lowerBound;
  }

  // Ensure the calculated maximum does not exceed the absolute upper bound.
  if (calculatedMax > upperBound) {
    calculatedMax = upperBound;
  }

  // Loop through the determined range and print each number.
  for (let sequenceElement = calculatedMin; sequenceElement <= calculatedMax; sequenceElement++) {
    console.log(sequenceElement); // Output the current sequence number to console.
  }
}

// Execute the primary function by reading input from standard input.
// This assumes an environment where 'fs' module is available (e.g., Node.js).
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));