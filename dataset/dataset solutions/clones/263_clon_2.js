// Function to compute all permutations of a specified length from a given array.
let genPermutations = function (sourceElements, requiredCount) {
  // Declare local variables for processing within this function.
  let currentElement, loopIndex, sourceLength = sourceElements.length;
  let resultPerms = [];

  // Base case for the recursion: if no elements are required,
  // return an array containing a single empty array as a valid permutation.
  if (requiredCount === 0) {
    return [
      []
    ];
  }

  // Iterate through each element in the provided source array.
  for (loopIndex = 0; loopIndex < sourceLength; loopIndex++) {
    // Remove the current element from the beginning of the source array
    // to use it for forming permutations.
    currentElement = sourceElements.shift();

    // Recursively generate permutations for the remaining elements
    // with one less element required.
    // Then, for each generated subset, prepend the current element.
    resultPerms = resultPerms.concat(
      genPermutations(sourceElements, requiredCount - 1).map(function (tempSubset) {
        // Prepend the current element to the temporary subset and return the modified subset.
        return (tempSubset.unshift(currentElement), tempSubset);
      })
    );
    // After processing, restore the current element to its original position
    // at the end of the source array for subsequent iterations.
    sourceElements.push(currentElement);
  }
  // Return the complete collection of all generated permutations.
  return resultPerms;
};

// Main execution function responsible for processing input data.
let executeProgram = function () {
  // Iterate over each individual record (line) obtained from the buffered input.
  rawInputBuffer.forEach(function (currentInputRecord) {
    let firstValue, targetSum; // Variables to store parsed numeric values from the input line.
    let matchCounter = 0; // A counter to track how many permutations meet the criteria.

    // If the current input record is empty after trimming whitespace, skip it.
    if (currentInputRecord.trim() === '') {
      return;
    }

    // Split the record by spaces and convert each segment into a floating-point number.
    currentInputRecord = currentInputRecord.split(' ').map(parseFloat);

    // Assign the parsed numeric values to descriptive variables.
    firstValue = currentInputRecord[0];
    targetSum = currentInputRecord[1];

    // Generate permutations of digits from 0 to 9, with a length specified by 'firstValue'.
    genPermutations([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], firstValue).forEach(function (generatedPermutation) {
      // Calculate a weighted sum for the current generated permutation.
      // Each digit is multiplied by its 1-based position index.
      // If this calculated sum matches the 'targetSum', increment the 'matchCounter'.
      matchCounter += generatedPermutation.reduce(function (accumulatedValue, digitValue, positionIndex) {
        return accumulatedValue + digitValue * (positionIndex + 1);
      }, 0) === targetSum ? 1 : 0;
    });
    // Output the final count of matching permutations for the current input record.
    console.log(matchCounter);
  });
};

// Global variable used to accumulate all incoming standard input data.
let rawInputBuffer = '';

// Signal the standard input stream to begin receiving data.
process.stdin.resume();
// Set the character encoding for the standard input stream to UTF-8.
process.stdin.setEncoding('utf8');

// Attach an event listener to the 'data' event of the standard input stream.
// This function will be called whenever a new data packet arrives.
process.stdin.on('data', function (dataPacket) {
  rawInputBuffer += dataPacket; // Append the new data packet to the global buffer.
});

// Attach an event listener to the 'end' event of the standard input stream.
// This function executes once all input data has been received.
process.stdin.on('end', function () {
  // Split the accumulated raw data buffer into an array of individual lines.
  rawInputBuffer = rawInputBuffer.split('\n');
  // Invoke the main program execution logic with the prepared input.
  executeProgram();
});