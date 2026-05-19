function processInput(rawInputData) {
  // Split the raw input string into an array of lines.
  const inputLines = rawInputData.split('\n');

  // The first line contains the number of elements.
  const arraySize = Number(inputLines.shift());

  // The second line contains the space-separated numbers, convert them to an array of numbers.
  const numericSequence = inputLines.shift().split(' ').map(Number);

  // Initialize a counter for swap operations.
  let swapOperations = 0;

  // Keep track of how many elements are already in their final sorted position from the end.
  let elementsProcessed = 0;

  // A flag to indicate if any swap occurred in the current pass.
  // The loop continues as long as swaps are being made.
  let hasSwapped = 1;

  // Main sorting loop (Bubble Sort variant).
  while (hasSwapped) {
    // Reset the swap flag for the current pass.
    hasSwapped = 0;

    // Iterate through the array from right to left, up to the already sorted part.
    for (let currentIdx = arraySize - 1; currentIdx > elementsProcessed; currentIdx--) {
      // Compare adjacent elements.
      if (numericSequence[currentIdx] < numericSequence[currentIdx - 1]) {
        // If elements are out of order, swap them.
        const tempVal = numericSequence[currentIdx];
        numericSequence[currentIdx] = numericSequence[currentIdx - 1];
        numericSequence[currentIdx - 1] = tempVal;

        // Set the flag to true, indicating a swap occurred.
        hasSwapped = 1;

        // Increment the swap counter.
        swapOperations++;
      }
    }
    // After each pass, one more element is guaranteed to be in its sorted position at the end.
    elementsProcessed++;
  }

  // Output the sorted array elements, joined by spaces.
  console.log(numericSequence.join(' '));

  // Output the total number of swaps performed.
  console.log(swapOperations);
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
