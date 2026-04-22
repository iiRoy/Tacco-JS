// This script initializes standard input processing.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// A buffer to accumulate all incoming data from standard input.
let receivedText = '';

// Event listener for incoming data chunks.
process.stdin.on('data', function (inputSegment) {
  receivedText += inputSegment; // Append the new segment to the buffer.
});

// Event listener for the end of standard input.
process.stdin.on('end', function () {
  // Once all input is received, split it into lines and pass to the main processing function.
  CoreAlgorithm(receivedText.split(/\r?\n/));
});

/**
 * Executes the core logic to process an array of input lines.
 * This function identifies elements that are in their "correct" position
 * and performs swaps to resolve them, counting the operations.
 * @param {string[]} parsedLines An array of strings, where each string is a line of input.
 */
function CoreAlgorithm(parsedLines) {
  // Parse the first line to get the total number of elements.
  const totalElements = parseInt(parsedLines[0], 10);

  // Split the second line into individual string tokens.
  const elementTokens = parsedLines[1].split(' ');

  // Initialize an array to hold parsed integer values.
  let integerSequence = new Array(totalElements);

  // Populate the integer sequence array by parsing each token.
  for (let currentIdx = 0; currentIdx < totalElements; currentIdx++) {
    integerSequence[currentIdx] = parseInt(elementTokens[currentIdx], 10);
  }

  // Counter for the number of necessary exchanges.
  let exchangeTally = 0;

  // Iterate through the integer sequence to find misplaced elements.
  for (let currentIdx = 0; currentIdx < totalElements; currentIdx++) {
    // Check if the current element is equal to its expected position + 1.
    if (integerSequence[currentIdx] === currentIdx + 1) {
      // If it's the last element and it's in its "correct" but problematic spot,
      // swap it with the preceding element.
      if (currentIdx === totalElements - 1) {
        exchangeElements(integerSequence, currentIdx, currentIdx - 1);
        exchangeTally++; // Increment the swap counter.
      }
      // Otherwise, swap the current element with the next one.
      else {
        exchangeElements(integerSequence, currentIdx, currentIdx + 1);
        exchangeTally++; // Increment the swap counter.
      }
    }
  }

  // Output the final count of exchanges.
  console.log(exchangeTally);
}

/**
 * Helper function to swap two elements within an array.
 * @param {Array<any>} targetArray The array in which to perform the swap.
 * @param {number} sourceIndex The index of the first element to swap.
 * @param {number} destinationIndex The index of the second element to swap.
 */
function exchangeElements(targetArray, sourceIndex, destinationIndex) {
  // Temporarily store the value at the source index.
  const temporaryValue = targetArray[sourceIndex];
  // Move the value from the destination index to the source index.
  targetArray[sourceIndex] = targetArray[destinationIndex];
  // Place the stored temporary value into the destination index.
  targetArray[destinationIndex] = temporaryValue;
}