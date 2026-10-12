(function () {
  // This variable will store all the raw input received from standard input.
  var rawData = '';

  /**
   * The main function orchestrates the program's execution.
   * It handles input parsing, sorting, and output generation.
   */
  function executeProgram () {
    // Declare various local variables needed for processing.
    var idx, dataLength, numericInputLine, stringNumbers, numericArray = [], finalOutput = '';

    // The first line of input typically contains the count of numbers.
    dataLength = +rawData[0];
    // The second line holds the actual numbers as a space-separated string.
    numericInputLine = rawData[1];
    // Split the string of numbers into an array of string representations.
    stringNumbers = numericInputLine.split(' ');

    // Iterate through the string numbers, converting each to an integer
    // and adding it to the numericArray.
    for (idx = 0; idx < dataLength; idx += 1) {
      numericArray.push(parseInt(stringNumbers[idx], 10));
    }

    // Invoke the quicksort algorithm to sort the array in place.
    // The sort is applied to the entire range from the first to the last element.
    performFastSort(numericArray, 0, dataLength - 1);

    // After sorting, construct the output string by joining the sorted numbers.
    // A space separates numbers, but no trailing space is added after the last number.
    for (idx = 0; idx < dataLength; idx += 1) {
      if (idx !== dataLength - 1) { // If it's not the very last element
        finalOutput += numericArray[idx] + ' '; // Append number followed by a space
      } else {
        finalOutput += numericArray[idx]; // Append the last number without a trailing space
      }
    }
    // Display the final sorted sequence to the console.
    console.log(finalOutput);
  }

  /**
   * Implements the QuickSort algorithm using a Hoare partition scheme.
   * This function sorts a specified segment of an array recursively.
   * @param {Array<number>} targetArray The array whose segment needs to be sorted.
   * @param {number} startIndex The starting index of the segment.
   * @param {number} endIndex The ending index of the segment.
   */
  function performFastSort (targetArray, startIndex, endIndex) {
    var rightPointer, leftPointer, pivotValue, temporaryHolder;

    // The sorting process only occurs if the segment contains more than one element.
    if (startIndex < endIndex) {
      leftPointer = startIndex;
      rightPointer = endIndex;
      // Select a pivot element using the median-of-three strategy for better performance.
      pivotValue = findMidValue(targetArray[leftPointer], targetArray[rightPointer], targetArray[Math.floor((leftPointer + rightPointer) / 2)]);

      // The partitioning loop: elements are rearranged around the pivot.
      do {
        // Increment the left pointer until an element greater than or equal to the pivot is found.
        while (targetArray[leftPointer] < pivotValue) {
          leftPointer += 1;
        }

        // Decrement the right pointer until an element less than or equal to the pivot is found.
        while (targetArray[rightPointer] > pivotValue) {
          rightPointer -= 1;
        }

        // If the pointers have met or crossed, the partitioning for this segment is complete.
        if (leftPointer >= rightPointer) {
          break;
        } else {
          // Swap the elements at the current left and right pointer positions.
          temporaryHolder = targetArray[leftPointer];
          targetArray[leftPointer] = targetArray[rightPointer];
          targetArray[rightPointer] = temporaryHolder;

          // Move both pointers inward after a successful swap.
          leftPointer += 1;
          rightPointer -= 1;
        }
      } while (leftPointer <= rightPointer); // Continue as long as the pointers haven't fully crossed

      // Recursively apply quicksort to the sub-arrays on either side of the pivot.
      // Sort the left partition.
      performFastSort(targetArray, startIndex, leftPointer - 1);
      // Sort the right partition.
      performFastSort(targetArray, rightPointer + 1, endIndex);
    }
  }

  /**
   * A utility function to determine the median value among three given numbers.
   * This is used to select a robust pivot in the QuickSort algorithm.
   * @param {number} valA The first numerical value.
   * @param {number} valB The second numerical value.
   * @param {number} valC The third numerical value.
   * @returns {number} The median of the three input values.
   */
  function findMidValue (valA, valB, valC) {
    // This complex ternary expression efficiently finds the median.
    return (valA <= valB) ? ((valB <= valC) ? valB : ((valA < valC) ? valC : valA)) : ((valA <= valC) ? valA : ((valB < valC) ? valC: valB));
  }
  
  // Configure Node.js standard input stream.
  process.stdin.resume(); // Ensures the process stays active to receive input.
  process.stdin.setEncoding('utf8'); // Specifies the character encoding for input data.
  
  // Attach an event listener to accumulate data chunks from stdin.
  process.stdin.on('data', function (chunkOfData) {
    rawData += chunkOfData; // Append each received chunk to the rawData string.
  });

  // Attach an event listener for when the standard input stream ends.
  process.stdin.on('end', function () {
    // Once all input is received, split it into an array of lines.
    rawData = rawData.split('\n');
    // Initiate the main program logic.
    executeProgram();
  });

}()); // The IIFE concludes here.
