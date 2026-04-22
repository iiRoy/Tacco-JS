(function () {
  // A global buffer to accumulate all raw input data received from standard input.
  let _globalRawInputStream = '';

  /**
   * A small utility function to facilitate the swapping of two elements within an array.
   * This is commonly used in sorting algorithms like QuickSort.
   * @param {Array<number>} dataCollection The array in which elements need to be swapped.
   * @param {number} indexA The index of the first element to swap.
   * @param {number} indexB The index of the second element to swap.
   */
  function exchangeArrayElements(dataCollection, indexA, indexB) {
    const temporaryStorageUnit = dataCollection[indexA];
    dataCollection[indexA] = dataCollection[indexB];
    dataCollection[indexB] = temporaryStorageUnit;
  }

  /**
   * Calculates and returns the median value among three provided numbers.
   * This function is crucial for selecting a robust pivot in the QuickSort implementation
   * to avoid worst-case performance on certain input distributions.
   * @param {number} firstValue The first number.
   * @param {number} secondValue The second number.
   * @param {number} thirdValue The third number.
   * @returns {number} The median of the three input values.
   */
  function determineMedianOfThree(firstValue, secondValue, thirdValue) {
    if (firstValue <= secondValue) {
      if (secondValue <= thirdValue) {
        return secondValue; // Scenario: firstValue <= secondValue <= thirdValue
      } else { // secondValue > thirdValue
        if (firstValue <= thirdValue) {
          return thirdValue; // Scenario: firstValue <= thirdValue < secondValue
        } else {
          return firstValue; // Scenario: thirdValue < firstValue <= secondValue
        }
      }
    } else { // firstValue > secondValue
      if (firstValue <= thirdValue) {
        return firstValue; // Scenario: secondValue < firstValue <= thirdValue
      } else { // firstValue > thirdValue
        if (secondValue <= thirdValue) {
          return thirdValue; // Scenario: secondValue <= thirdValue < firstValue
        } else {
          return secondValue; // Scenario: thirdValue < secondValue < firstValue
        }
      }
    }
  }

  /**
   * Executes a recursive QuickSort algorithm on a specified segment of an array.
   * It partitions the array segment around a pivot element and then recursively sorts
   * the sub-segments. The pivot is chosen using the median-of-three strategy.
   * @param {Array<number>} targetArraySegment The array segment that needs to be sorted.
   * @param {number} segmentStart The starting index (inclusive) of the segment.
   * @param {number} segmentEnd The ending index (inclusive) of the segment.
   */
  function performArrayPartitionAndSort(targetArraySegment, segmentStart, segmentEnd) {
    // The sorting only proceeds if the segment contains more than one element.
    if (segmentStart < segmentEnd) {
      let leftScanPointer = segmentStart;
      let rightScanPointer = segmentEnd;
      
      // Calculate the middle index for median-of-three pivot selection.
      const middleIndex = Math.floor((segmentStart + segmentEnd) / 2);
      // Determine a robust pivot value using the median of the first, last, and middle elements.
      const partitionElementValue = determineMedianOfThree(
        targetArraySegment[segmentStart],
        targetArraySegment[segmentEnd],
        targetArraySegment[middleIndex]
      );

      // The core partitioning loop: elements are rearranged such that values
      // less than the pivot are moved to its left, and greater values to its right.
      while (true) {
        // Increment left pointer until an element greater than or equal to the pivot is found.
        while (targetArraySegment[leftScanPointer] < partitionElementValue) {
          leftScanPointer++;
        }

        // Decrement right pointer until an element less than or equal to the pivot is found.
        while (targetArraySegment[rightScanPointer] > partitionElementValue) {
          rightScanPointer--;
        }

        // If the pointers have crossed or met, the partitioning for this segment is complete.
        if (leftScanPointer >= rightScanPointer) {
          break;
        } else {
          // If pointers haven't crossed, swap the elements at their current positions.
          // This moves a 'too large' element from the left side and a 'too small' element from the right side.
          exchangeArrayElements(targetArraySegment, leftScanPointer, rightScanPointer);
          // Advance both pointers to continue the scan.
          leftScanPointer++;
          rightScanPointer--;
        }
      }

      // Recursively call the sort function on the sub-arrays.
      // The pivot element is now in its final sorted position and is excluded from further recursive calls.
      performArrayPartitionAndSort(targetArraySegment, segmentStart, leftScanPointer - 1);
      performArrayPartitionAndSort(targetArraySegment, rightScanPointer + 1, segmentEnd);
    }
  }

  /**
   * This function encapsulates the primary processing logic of the application.
   * It takes raw input lines, parses them, sorts the numerical data, and formats the output.
   * @param {string[]} receivedInputLines An array of strings, where each string represents a line from the input.
   * @returns {string} A space-separated string of the sorted numbers. Returns an empty string on error.
   */
  function executeCoreProcessing(receivedInputLines) {
    const RADIX_DECIMAL_CONSTANT = 10; // Standard radix for parsing integers.

    // Input validation: Ensure there are at least two lines for the number count and the actual numbers.
    if (!receivedInputLines || receivedInputLines.length < 2) {
      console.error("Operational Error: Insufficient input lines detected. Expected at least two lines.");
      return "";
    }

    // The first line is expected to contain the total count of numbers.
    const expectedElementCount = parseInt(receivedInputLines[0].trim(), RADIX_DECIMAL_CONSTANT);

    // The second line contains the space-separated string of numbers.
    const numbersSequenceString = receivedInputLines[1].trim();

    // Further validation for the parsed count and the number sequence string.
    if (isNaN(expectedElementCount) || expectedElementCount <= 0 || !numbersSequenceString) {
      console.error("Operational Error: Invalid or absent number count or sequence string.");
      return "";
    }

    // Split the number sequence string into individual tokens (strings).
    // Filter out any empty strings that might arise from multiple spaces between numbers.
    const numberStringTokens = numbersSequenceString.split(' ');
    const numericDataCollection = numberStringTokens
                                    .filter(token => token !== '')
                                    .map(token => parseInt(token, RADIX_DECIMAL_CONSTANT));

    // Optional: Log a warning if the actual number of parsed elements doesn't match the expected count.
    if (numericDataCollection.length !== expectedElementCount) {
        console.warn(`Data Mismatch Warning: Expected ${expectedElementCount} numbers but found ${numericDataCollection.length}. Processing with actual count.`);
    }

    // Apply the QuickSort algorithm to the collected numeric data.
    // The sorting happens in-place on the numericDataCollection array.
    performArrayPartitionAndSort(numericDataCollection, 0, numericDataCollection.length - 1);

    // Join the sorted numbers back into a single space-separated string for output.
    const formattedOutputString = numericDataCollection.join(' ');
    
    return formattedOutputString;
  }
  
  // Initialize the standard input stream to be resumable and set its encoding.
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  // Attach an event listener for 'data' events on the standard input stream.
  // Each incoming chunk of data is appended to the global buffer.
  process.stdin.on('data', function (incomingChunkSegment) {
    _globalRawInputStream += incomingChunkSegment;
  });

  // Attach an event listener for the 'end' event on the standard input stream.
  // This signifies that all input has been received.
  process.stdin.on('end', function () {
    // Once input stream concludes, split the entire accumulated raw input into individual lines.
    const processedInputLines = _globalRawInputStream.split('\n');
    // Invoke the core processing logic with the prepared input lines.
    const finalSortedResult = executeCoreProcessing(processedInputLines);
    // Output the final formatted result to standard output.
    console.log(finalSortedResult);
  });

}());