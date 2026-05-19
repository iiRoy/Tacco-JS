const cfg = { input: '/dev/stdin', newline: '\n' }; // Configuration for input stream

const dataFlow = require('fs').createReadStream(cfg.input);

let currentValue = 0; // Accumulates digits to form a number
let wasDigit = false; // Flag to indicate if the previous character was a digit
const inputNumbers = []; // Stores parsed numbers from the input

dataFlow.on('readable', function() {
  let bufferChunk; // Buffer holding a chunk of data
  let idx; // Loop index

  bufferChunk = dataFlow.read();
  if (bufferChunk === null) {
    return; // No data available, exit
  }

  // Search for the last newline character to avoid splitting numbers across chunks
  for (idx = Math.min(20, bufferChunk.length - 1); idx > 0 && bufferChunk[idx - 1] !== 0x0a; idx--) {
    /* intentionally empty loop body */
  }

  // Process the buffer chunk character by character
  for (; idx < bufferChunk.length; idx++) {
    if (bufferChunk[idx] >= 0x30 && bufferChunk[idx] <= 0x39) { // Check if character is a digit (0-9)
      currentValue = 10 * currentValue + (bufferChunk[idx] - 0x30); // Build the number
      wasDigit = true; // Mark that a digit was encountered
    } else {
      if (wasDigit) { // If a number was being formed
        inputNumbers.push(currentValue); // Add the completed number to the list
      }
      currentValue = 0; // Reset current number
      wasDigit = false; // Reset digit flag
    }
  }
});

dataFlow.on('end', function() {
  let initialCopy; // A copy of the input numbers for the merge sort

  if (wasDigit) { // If a number was pending at the end of the stream
    inputNumbers.push(currentValue); // Add the last number
  }

  initialCopy = [].concat(inputNumbers); // Create a shallow copy of the array

  // Call the merge sort function and print the total inversion count
  console.log(mergeAndCountInversions(inputNumbers, initialCopy, 0, inputNumbers.length));
});

function mergeAndCountInversions(workingArray, tempArray, startIndex, endIndex) {
  let inversionCount; // Counts inversions
  let temporaryVar; // Used for swapping elements
  let middleIndex; // Midpoint for splitting arrays
  let firstHalfIdx; // Index for the first half of the array
  let secondHalfIdx; // Index for the second half of the array
  let mergeIdx; // Index for merging back into the working array

  // Base cases for recursion
  if (endIndex - startIndex <= 1) {
    return 0; // Array with 0 or 1 element is already sorted, no inversions
  }

  if (endIndex - startIndex === 2) { // Array with two elements
    if (workingArray[startIndex] > workingArray[startIndex + 1]) {
      temporaryVar = workingArray[startIndex + 1];
      workingArray[startIndex + 1] = workingArray[startIndex];
      workingArray[startIndex] = temporaryVar;
      return 1; // One inversion found and fixed
    }
    return 0; // No inversion
  }

  // Recursive step
  inversionCount = 0;
  middleIndex = Math.floor((startIndex + endIndex) / 2); // Calculate midpoint

  // Recursively sort the first half and count inversions
  inversionCount += mergeAndCountInversions(tempArray, workingArray, startIndex, middleIndex);
  // Recursively sort the second half and count inversions
  inversionCount += mergeAndCountInversions(tempArray, workingArray, middleIndex, endIndex);

  // Merge step
  firstHalfIdx = startIndex; // Pointer for the first sorted half (in tempArray)
  secondHalfIdx = middleIndex; // Pointer for the second sorted half (in tempArray)

  // Merge the two sorted halves back into workingArray
  for (mergeIdx = startIndex; mergeIdx < endIndex; mergeIdx++) {
    if (firstHalfIdx === middleIndex) { // First half exhausted
      workingArray[mergeIdx] = tempArray[secondHalfIdx++];
    } else if (secondHalfIdx === endIndex) { // Second half exhausted
      workingArray[mergeIdx] = tempArray[firstHalfIdx++];
    } else if (tempArray[firstHalfIdx] < tempArray[secondHalfIdx]) { // Element from first half is smaller
      workingArray[mergeIdx] = tempArray[firstHalfIdx++];
    } else { // Element from second half is smaller (or equal) - this is an inversion
      workingArray[mergeIdx] = tempArray[secondHalfIdx++];
      // Count inversions: all remaining elements in the first half are greater than the current element from the second half
      inversionCount += middleIndex - firstHalfIdx;
    }
  }
  return inversionCount; // Return the total count of inversions for this segment
}
