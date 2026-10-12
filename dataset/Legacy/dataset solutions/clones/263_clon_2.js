function generatePermutations(inputArray, count) {
  // Declare local variables for permutation generation process
  let currentElement,
      idx,
      arrayLength = inputArray.length,
      resultPermutations = [];

  // Base case: if the desired permutation length is zero,
  // return an array containing a single empty array.
  if (count === 0) {
    return [[]];
  }

  // Iterate through each element of the current input array
  for (idx = 0; idx < arrayLength; idx++) {
    // Remove the first element from the array for the current iteration
    currentElement = inputArray.shift();

    // Recursively generate permutations for the remaining elements
    // with one less element needed, then prepend the current element
    // to each of these sub-permutations.
    resultPermutations = resultPermutations.concat(
      generatePermutations(inputArray, count - 1).map(function(subPermutation) {
        // Add the previously removed element to the beginning of the sub-permutation
        subPermutation.unshift(currentElement);
        return subPermutation;
      })
    );

    // Add the current element back to the end of the array
    // to restore the array's state for subsequent iterations.
    inputArray.push(currentElement);
  }
  // Return the collection of all generated permutations
  return resultPermutations;
}

function executeProgram() {
  // Process each line of the global program input data
  programInput.forEach(function(currentLine) {
    // Declare variables for problem parameters and the final count
    let numElements,
        targetSum,
        validCombinationsCount = 0; // Initialize counter for combinations meeting criteria

    // If the current line is empty after trimming whitespace, skip it
    if (currentLine.trim() === '') {
      return;
    }

    // Parse the line: split by space, then convert parts to floating-point numbers
    currentLine = currentLine.split(' ').map(parseFloat);
    numElements = currentLine[0]; // The first number is 'n'
    targetSum = currentLine[1];   // The second number is 's'

    // Generate all permutations of digits [0-9] of length 'numElements'
    // and iterate through each generated permutation
    generatePermutations([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], numElements).forEach(function(permutationSet) {
      // Calculate the weighted sum for the current permutation:
      // sum of (element_value * (its_1_based_index))
      const currentWeightedSum = permutationSet.reduce(function(accumulator, elementValue, elementIndex) {
        // Add the product of the element's value and its 1-based position
        return accumulator + elementValue * (elementIndex + 1);
      }, 0); // Start the sum from 0

      // If the calculated weighted sum matches the target sum, increment the counter
      if (currentWeightedSum === targetSum) {
        validCombinationsCount++;
      }
    });
    // Output the total count of valid combinations for the current input line
    console.log(validCombinationsCount);
  });
}

// Global variable to store all input received from stdin
let programInput = '';

// Resume the standard input stream to begin listening for data
process.stdin.resume();
// Set the character encoding for the incoming data to UTF-8
process.stdin.setEncoding('utf8');

// Event listener for when data chunks are received from stdin
process.stdin.on('data', function(chunkOfData) {
  // Append each received chunk of data to the global input string
  programInput += chunkOfData;
});

// Event listener for when the standard input stream ends
process.stdin.on('end', function() {
  // Once all input is received, split the accumulated string into an array of lines
  programInput = programInput.split('\n');
  // Call the main program execution function
  executeProgram();
});
