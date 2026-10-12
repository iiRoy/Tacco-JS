let rawDataBuffer = ''; // Buffer to accumulate incoming data from standard input

// Event listener for 'data' chunks from stdin
process.stdin.on('data', chunkOfData => {
    rawDataBuffer += chunkOfData; // Append each data chunk to the buffer
});

// Event listener for the 'end' of stdin input
process.stdin.on('end', function() {
    // Process the raw data:
    // 1. Remove trailing whitespace from the entire buffer.
    // 2. Split the buffer into an array of lines.
    // 3. For each line, remove any trailing whitespace.
    rawDataBuffer = rawDataBuffer.replace(/\s*$/, '')
        .split('\n')
        .map(lineSegment => lineSegment.replace(/\s*$/, ''));

    // Extract the second line (index 1), split it by spaces,
    // and convert each part to a number before passing to the sorting function.
    performSelectionSort(rawDataBuffer[1].split(' ').map(lineSegment => Number(lineSegment)));
});

/**
 * Implements the Selection Sort algorithm on an array of numbers.
 * It sorts the array in ascending order and prints the sorted array
 * and the total number of swaps performed.
 * @param {number[]} dataCollection - The array of numbers to be sorted.
 */
const performSelectionSort = (dataCollection) => {
  let exchangeCount = 0; // Counter for the number of element swaps

  // Outer loop: iterate through each element of the array
  for (let outerIndex = 0; outerIndex < dataCollection.length; outerIndex++) {
    let minimumElementIndex = outerIndex; // Assume the current element is the minimum

    // Inner loop: find the smallest element in the unsorted part of the array
    for (let innerIndex = outerIndex; innerIndex < dataCollection.length; innerIndex++) {
      // If a smaller element is found, update the index of the minimum element
      if (dataCollection[innerIndex] < dataCollection[minimumElementIndex]) {
        minimumElementIndex = innerIndex;
      }
    }

    // Store the values of the elements to be potentially swapped
    const currentElement = dataCollection[outerIndex];
    const minElementValue = dataCollection[minimumElementIndex];

    // Perform the swap only if the current element is not already the minimum
    if (currentElement !== minElementValue) {
      dataCollection[minimumElementIndex] = currentElement; // Place the current element at the minimum's position
      dataCollection[outerIndex] = minElementValue;         // Place the minimum element at the current position
      exchangeCount++;                                       // Increment the swap counter
    }
  }

  // Output the sorted array, joined by spaces
  console.log(dataCollection.join(' '));
  // Output the total number of swaps made
  console.log(exchangeCount);
};
