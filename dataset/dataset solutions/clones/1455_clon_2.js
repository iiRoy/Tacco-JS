( function () {
  // This variable accumulates all incoming data from standard input.
  let dataBuffer = '';

  // The primary function that orchestrates the data processing and sorting.
  function executeProgram () {
    // Declare local variables for loop indices, counts, an unused placeholder,
    // temporary strings, and the final result.
    let idx, count, processingItem, numStringLine, tokenizedNumbers, integerList = [], outputString = '';

    // The first line of input represents the total count of numbers to process.
    count = Number(dataBuffer[0]);

    // The second line of input contains the space-separated numbers.
    numStringLine = dataBuffer[1];

    // Split the string of numbers into an array of individual number strings.
    tokenizedNumbers = numStringLine.split(' ');

    // Iterate through the tokenized numbers and convert them to integers, storing them in a new array.
    for (idx = 0; idx < count; idx += 1) {
      integerList.push(Number.parseInt(tokenizedNumbers[idx], 10));
    }

    // Apply the quicksort algorithm to sort the array of integers.
    performQuickSort(integerList, 0, count - 1);

    // After sorting, concatenate the sorted numbers into a single output string, separated by spaces.
    for (idx = 0, count = integerList.length; idx < count; idx += 1) {
      outputString += integerList[idx] + ' ';
    }
    // Print the final sorted string to the console.
    console.log(outputString);
  }

  // Implements the QuickSort algorithm to efficiently sort an array of numbers in place.
  function performQuickSort (targetArray, startIndex, endIndex) {
    let rightPointer, leftPointer, pivotValue, temporaryHolder;

    // The base case for recursion: if the sub-array has one or zero elements, it's already sorted.
    if (startIndex < endIndex) {
      leftPointer = startIndex;
      rightPointer = endIndex;

      // Select a pivot element using the median-of-three strategy for better performance.
      pivotValue = findMedianOfThree(targetArray[leftPointer], targetArray[rightPointer], targetArray[Math.floor((leftPointer + rightPointer) / 2)]);

      // Partitioning loop: elements smaller than the pivot move to the left, larger to the right.
      do {
        // Increment left pointer until an element greater than or equal to the pivot is found.
        while (targetArray[leftPointer] < pivotValue) {
          leftPointer++;
        }

        // Decrement right pointer until an element less than or equal to the pivot is found.
        while (targetArray[rightPointer] > pivotValue) {
          rightPointer--;
        }

        // If pointers have crossed or met, the partition is complete.
        if (leftPointer >= rightPointer) {
          break;
        } else {
          // Swap the elements at the left and right pointers.
          temporaryHolder = targetArray[leftPointer];
          targetArray[leftPointer] = targetArray[rightPointer];
          targetArray[rightPointer] = temporaryHolder;

          // Move pointers inward after a swap.
          leftPointer++;
          rightPointer--;
        }
      } while (leftPointer <= rightPointer); // Continue as long as pointers haven't crossed.

      // Recursively sort the sub-array to the left of the pivot.
      performQuickSort(targetArray, startIndex, leftPointer - 1);
      // Recursively sort the sub-array to the right of the pivot.
      performQuickSort(targetArray, rightPointer + 1, endIndex);
    }
  }

  // A helper function to determine the median value among three given numbers.
  function findMedianOfThree (val1, val2, val3) {
    // This complex ternary expression correctly identifies the median.
    return (val1 <= val2) ? ( (val2 <= val3) ? val2 : ( (val1 < val3) ? val3 : val1 ) ) : ( (val1 <= val3) ? val1 : ( (val2 < val3) ? val3 : val2 ) );
  }

  // --- Standard input handling for Node.js environment ---

  // Resume the standard input stream to listen for data.
  process.stdin.resume();
  // Set the encoding for incoming data to UTF-8.
  process.stdin.setEncoding('utf8');

  // Event listener for incoming data chunks.
  process.stdin.on('data', function (dataChunk) {
    dataBuffer += dataChunk; // Append the received chunk to the data buffer.
  });

  // Event listener for the end of the input stream.
  process.stdin.on('end', function () {
    // When all input is received, split the buffer by newlines.
    dataBuffer = dataBuffer.split('\n');
    // Then, invoke the main program execution function.
    executeProgram();
  });

} () ); // Immediately Invoked Function Expression (IIFE) closure.