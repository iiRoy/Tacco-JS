(function () {
  // This variable will accumulate all incoming data from standard input.
  var rawData = '';

  /**
   * The primary function to process the collected input and perform sorting.
   * It reads numbers, sorts them using a quicksort algorithm, and prints the result.
   */
  function processData () {
    var idx, count, val, numberString, stringNumbers, numericArray = [], outputString = '';

    // The first line of input specifies the count of numbers.
    count = +rawData[0];
    // The second line contains the space-separated numbers.
    numberString = rawData[1];
    stringNumbers = numberString.split(' ');

    // Convert string numbers to integers and populate the array.
    for (idx = 0; idx < count; idx += 1) {
      numericArray.push(parseInt(stringNumbers[idx], 10));
    }

    // Perform the quicksort operation on the array.
    fastSort(numericArray, 0, count - 1);

    // Format the sorted numbers into a single space-separated string for output.
    for (idx = 0, count = numericArray.length; idx < count; idx += 1) {
      outputString += numericArray[idx] + ' ';
    }
    // Print the final sorted string to the console.
    console.log(outputString);
  }

  /**
   * Implements the quicksort algorithm to sort an array of numbers in place.
   * @param {Array<number>} dataArray - The array of numbers to be sorted.
   * @param {number} startIndex - The starting index of the sub-array to sort.
   * @param {number} endIndex - The ending index of the sub-array to sort.
   */
  function fastSort (dataArray, startIndex, endIndex) {
    var rightPointer, leftPointer, partitionValue, temporaryHolder;

    // Only proceed if the sub-array has more than one element.
    if (startIndex < endIndex) {
      leftPointer = startIndex;
      rightPointer = endIndex;
      // Select a pivot using the median-of-three strategy.
      partitionValue = findMidValue(dataArray[leftPointer], dataArray[rightPointer], dataArray[Math.floor((leftPointer + rightPointer) / 2)]);

      // Partitioning loop
      do {
        // Move left pointer until an element greater than or equal to the pivot is found.
        while (dataArray[leftPointer] < partitionValue) {
          leftPointer += 1;
        }

        // Move right pointer until an element less than or equal to the pivot is found.
        while (dataArray[rightPointer] > partitionValue) {
          rightPointer -= 1;
        }

        // If pointers have crossed or met, break the loop.
        if (leftPointer >= rightPointer) {
          break;
        } else {
          // Swap elements at left and right pointers.
          temporaryHolder = dataArray[leftPointer];
          dataArray[leftPointer] = dataArray[rightPointer];
          dataArray[rightPointer] = temporaryHolder;

          // Move pointers inwards.
          leftPointer += 1;
          rightPointer -= 1;
        }
      } while (leftPointer <= rightPointer); // Continue as long as pointers haven't crossed.

      // Recursively sort the sub-arrays.
      fastSort(dataArray, startIndex, leftPointer - 1);
      fastSort(dataArray, rightPointer + 1, endIndex);
    }
  }

  /**
   * Determines the median of three given numbers. Used for pivot selection in quicksort.
   * @param {number} valA - The first number.
   * @param {number} valB - The second number.
   * @param {number} valC - The third number.
   * @returns {number} The median of the three numbers.
   */
  function findMidValue (valA, valB, valC) {
    // This complex ternary expression correctly finds the median.
    return (valA <= valB)
      ? ((valB <= valC) ? valB : ((valA < valC) ? valC : valA))
      : ((valA <= valC) ? valA : ((valB < valC) ? valC : valB));
  }

  // Set up standard input handling.
  process.stdin.resume(); // Keep the process alive for input.
  process.stdin.setEncoding('utf8'); // Specify UTF-8 encoding for input.

  // Event listener for incoming data chunks.
  process.stdin.on('data', function (dataChunk) {
    rawData += dataChunk; // Append each chunk to the rawData string.
  });

  // Event listener for the end of input stream.
  process.stdin.on('end', function () {
    // Split the accumulated raw data by newline characters.
    rawData = rawData.split('\n');
    // Once all input is received, initiate the main processing.
    processData();
  });

}());
