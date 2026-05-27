// This function recursively generates permutations of a given length from a source array.
// It calls a callback function for each generated permutation.
function generateSequences(sourceItems, sequenceLength, currentCombination, onCombinationFound) {
  var extractedItem, loopCounter, sourceLength = sourceItems.length;
  // Initialize currentCombination if it's not provided (first call)
  currentCombination = currentCombination || [];

  // Base case: if the desired sequence length is reached, invoke the callback
  if (sequenceLength === 0) {
    onCombinationFound(currentCombination);
  } else {
    // Recursive step: iterate through available items
    for (loopCounter = 0; loopCounter < sourceLength; loopCounter++) {
      // Take an item from the source
      extractedItem = sourceItems.shift();
      // Add it to the current combination
      currentCombination.push(extractedItem);

      // Recurse with one less item needed and the updated combination
      generateSequences(sourceItems, sequenceLength - 1, currentCombination, onCombinationFound);

      // Backtrack: remove the last added item from the current combination
      currentCombination.pop();
      // Put the item back into the source array for other branches
      sourceItems.push(extractedItem);
    }
  }
}

// Main program execution logic
function processProgram() {
  programInputBuffer.forEach(function(currentInputLine) {
    var desiredLength, targetSum, matchingCombinationsCount = 0;

    // Skip empty lines
    if (currentInputLine.trim() === '') {
      return;
    }

    // Parse the input line into numbers
    currentInputLine = currentInputLine.split(' ').map(parseFloat);
    desiredLength = currentInputLine[0];
    targetSum = currentInputLine[1];

    // Generate sequences using digits 0-9
    generateSequences([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], desiredLength, [], function(generatedSequence) {
      // Calculate the weighted sum for the current sequence
      var currentSequenceWeightedSum = generatedSequence.reduce(function(runningSum, sequenceElement, elementPosition) {
        return runningSum + sequenceElement * (elementPosition + 1);
      }, 0); // Initial sum is zero

      // If the weighted sum matches the target sum, increment the counter
      if (currentSequenceWeightedSum === targetSum) {
        matchingCombinationsCount++;
      }
    });

    // Output the total count of matching combinations for the current input line
    console.log(matchingCombinationsCount);
  });
}

// Global variable to accumulate input data
var programInputBuffer = '';

// Set up standard input processing
process.stdin.resume(); // Keep the process alive
process.stdin.setEncoding('utf8'); // Expect UTF-8 encoded text

// Event listener for incoming data chunks
process.stdin.on('data', function(incomingDataChunk) {
  programInputBuffer += incomingDataChunk; // Append data to the buffer
});

// Event listener for end of input stream
process.stdin.on('end', function() {
  // Split the accumulated input into lines and then process them
  programInputBuffer = programInputBuffer.split('\n');
  processProgram(); // Start the main program logic
});
