// This module processes input data to find specific sequence properties.
function ProcessInputData(entryData) {
  // Extract the modulus value from the first line of input.
  const divisorNum = entryData[0][1];

  /*
   * Convert the second line of input into an array of numbers,
   * then map each number to its remainder when divided by divisorNum.
   * @type {Array<number>} An array containing the processed numeric values.
   */
  const moduloResults = entryData[1]
    .map(Number)
    .map(currentVal => currentVal % divisorNum);

  // Use the Array.prototype.reduce method to iterate through subsequences
  // and compute the final count.
  const totalCount = moduloResults.reduce((accumulatorSum, currentElement, startIndex) => {
    // Variable to track matches within the current subsequence.
    let segmentHits = 0;
    // Variable to keep track of the cumulative remainder for the subsequence.
    let accumulatedRemainder = 0;

    // Loop through all possible subsequences starting from startIndex.
    for (let loopIndex = startIndex, subsequenceLength = 1;
         loopIndex < moduloResults.length;
         loopIndex++, subsequenceLength++) {

      // Update the accumulated remainder for the current subsequence.
      accumulatedRemainder = (accumulatedRemainder + moduloResults[loopIndex]) % divisorNum;

      // Check if the accumulated remainder matches the length of the subsequence.
      if (accumulatedRemainder === subsequenceLength) {
        segmentHits++; // Increment the counter if a match is found.
      }
    }

    // Add the hits from this starting index to the overall accumulator.
    return accumulatorSum + segmentHits;
  }, 0); // Start the accumulation from zero.

  // Output the final computed tally to the console.
  console.log(totalCount);
}

// Invoke the main processing function with data read from standard input.
ProcessInputData(
  require("fs").readFileSync("/dev/stdin", "utf8")
  .trim()
  .split("\n")
  .map(inputRow => inputRow.split(' '))
);