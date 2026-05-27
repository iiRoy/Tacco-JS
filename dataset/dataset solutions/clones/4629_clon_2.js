require('readline')
  .createInterface({
    input: process.stdin, // Standard input stream for reading data
    output: process.stdout // Standard output stream for writing results
  })
  .on('line', processInputLine); // Event listener for each line of input

let toggleState = false; // A boolean flag used to skip the first line of input

/**
 * Processes each line of input received from stdin.
 * @param {string} inputStr The raw string line read from input.
 */
function processInputLine(inputStr) {
  // This conditional statement is designed to skip the very first line of input.
  // It flips the toggleState and returns if it becomes true (i.e., on the first call).
  if ((toggleState = !toggleState)) {
    return;
  }

  // Parses the input string, splitting it by spaces and converting each part to an integer.
  const parsedNumbers = inputStr.split(' ').map(val => Number.parseInt(val, 10));

  // Determines the sequence of gradient signs (increase, decrease, or flat) between consecutive numbers.
  const gradientSigns = determineGradients(parsedNumbers[0], parsedNumbers[1], ...parsedNumbers.slice(2));

  // Calculates the total number of segments based on changes in the gradient signs.
  const finalCount = calculateSegments(1, gradientSigns[0], gradientSigns[1], ...gradientSigns.slice(2));

  // Prints the final calculated segment count to stdout.
  console.log(finalCount);
}

/**
 * Recursively computes the gradient signs between adjacent numbers in a sequence.
 * @param {number} valA The current number in the sequence.
 * @param {number} valB The next number in the sequence.
 * @param {number[]} remainingVals An array containing the rest of the numbers.
 * @returns {number[]} An array of gradient signs (-1 for decreasing, 0 for flat, 1 for increasing).
 */
function determineGradients(valA, valB, ...remainingVals) {
  // Calculates the sign of the difference between valB and valA.
  // Returns -1 if valB < valA, 0 if valB == valA, 1 if valB > valA.
  const directionIndicator = Math.sign(valB - valA);

  // If the directionIndicator is NaN (e.g., if valB is undefined, indicating end of sequence),
  // return an empty array as there are no more gradients.
  if (Number.isNaN(directionIndicator)) {
    return [];
  } else {
    // Otherwise, return the current directionIndicator followed by the gradients of the rest of the sequence.
    return [directionIndicator, ...determineGradients(valB, ...remainingVals)];
  }
}

/**
 * Recursively counts the number of segments where the gradient sign changes.
 * A new segment is counted when the current gradient sign differs from the next.
 * @param {number} segmentCount The current accumulated count of segments.
 * @param {number} currentSign The gradient sign of the current segment being evaluated.
 * @param {number} nextSign The gradient sign of the next potential segment.
 * @param {number[]} furtherSigns An array containing the subsequent gradient signs.
 * @returns {number} The total number of distinct segments.
 */
function calculateSegments(segmentCount, currentSign, nextSign, ...furtherSigns) {
  // Base case: If 'nextSign' is undefined, it means we have processed all gradient signs.
  // Return the final accumulated segment count.
  if (typeof nextSign === 'undefined') {
    return segmentCount;
  }

  // If the 'currentSign' is different from the 'nextSign', it indicates the start of a new segment.
  // Increment the segment count and continue processing the 'furtherSigns'.
  if (currentSign !== nextSign) {
    return calculateSegments(++segmentCount, ...furtherSigns);
  } else {
    // If the 'currentSign' is the same as the 'nextSign', they belong to the same segment.
    // Continue processing without incrementing the segment count, using the 'currentSign'
    // as the reference for the next comparison.
    return calculateSegments(segmentCount, currentSign, ...furtherSigns);
  }
}
