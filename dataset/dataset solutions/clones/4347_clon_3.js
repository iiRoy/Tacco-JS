process.stdin.resume();

process.stdin.setEncoding('utf8');

// Storage container for incoming lines of text from the standard input.
const incomingDataRows = [];

// Utility for reading input line by line from the designated streams.
const inputLineProcessor = require('readline').createInterface({
  input: process.stdin,  // Source for reading input
  output: process.stdout // Destination for output (though not used for direct output here)
});

/**
 * Event handler for each new line received from the input stream.
 * Stores the processed line content into our temporary data array.
 * @param {string} currentLineContent - The content of the current line read.
 */
inputLineProcessor.on('line', (currentLineContent) => {
  incomingDataRows.push(currentLineContent);
});

/**
 * Helper function to safely parse a string into a number.
 * Mimics Number() behavior for non-numeric inputs (returns NaN).
 * @param {string} inputString - The string to parse.
 * @returns {number} The parsed number or NaN if parsing fails.
 */
const parseNumericValue = (inputString) => {
    return Number(inputString);
};

/**
 * Calculates the contribution of a single numeric element based on a main threshold.
 * This logic precisely replicates the original conditional addition.
 * @param {number} currentElement - The individual element value.
 * @param {number} mainThreshold - The primary threshold value for comparison.
 * @returns {number} The calculated contribution for the element.
 */
const determineElementContribution = (currentElement, mainThreshold) => {
    // Calculate the floor value of half the threshold, used in the first comparison.
    const floorHalfThreshold = Math.floor(mainThreshold / 2);
    // Calculate the precise half threshold, used in the second comparison.
    const preciseHalfThreshold = mainThreshold / 2;
    let elementContribution = 0; // Initialize contribution for this element

    // Condition 1: Element is strictly less than the floored half threshold.
    if (currentElement < floorHalfThreshold) {
        elementContribution = currentElement * 2;
    }
    // Condition 2: Element is strictly greater than the precise half threshold.
    else if (currentElement > preciseHalfThreshold) {
        // Calculate the difference from the main threshold and double it.
        elementContribution = (mainThreshold - currentElement) * 2;
    }
    // Implicit else: If neither condition met (e.g., currentElement equals floorHalfThreshold or preciseHalfThreshold),
    // contribution remains 0, mirroring the original logic's omission of an 'else' block.
    return elementContribution;
};

/**
 * Event handler triggered when the input stream concludes.
 * Processes the collected lines and performs the main calculation.
 */
inputLineProcessor.on('close', () => {
  // Guard clause: Ensure we have at least three lines of input data.
  // The original code would throw errors if lines[0], lines[1], or lines[2] were undefined.
  if (incomingDataRows.length < 3) {
    console.error('Error: Insufficient input data provided. Expected at least 3 lines for processing.');
    return; // Terminate processing due to invalid input length.
  }

  // Parse the first line to get the count of elements expected in the sequence.
  const totalElementsCount = parseNumericValue(incomingDataRows[0]);
  // Parse the second line to get the main threshold value used in calculations.
  const mainThresholdValue = parseNumericValue(incomingDataRows[1]);

  // Parse the third line: split by spaces, then convert each part to a number.
  // Utilizes a concise arrow function and the helper `parseNumericValue`.
  const numericSequence = incomingDataRows[2].split(' ').map(valueAsString => parseNumericValue(valueAsString));

  // Validation step: Check if the actual number of elements matches the declared count.
  if (numericSequence.length !== totalElementsCount) {
      console.warn(`Warning: Expected ${totalElementsCount} elements based on the first line, but found ${numericSequence.length} in the sequence. Processing will use the smaller of these two counts to prevent out-of-bounds access.`);
  }

  // Initialize the accumulator for the final computed result.
  let cumulativeResult = 0;

  // Iterate through the numeric sequence. The loop runs up to the declared count
  // or the actual length of the sequence, whichever is smaller, for robustness.
  for (let elementIndex = 0; elementIndex < Math.min(totalElementsCount, numericSequence.length); ++elementIndex) {
    const currentElementValue = numericSequence[elementIndex];
    // Calculate and add the contribution of the current element to the total.
    cumulativeResult += determineElementContribution(currentElementValue, mainThresholdValue);
  }

  // Output the final computed aggregate value, with a descriptive label.
  console.log(`Final calculated aggregate: ${cumulativeResult}`);
});