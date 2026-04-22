/* This self-executing anonymous function encapsulates the entire application logic. */
(function() {
  // Variable to accumulate all incoming raw data from standard input.
  var incomingData = '';

  /**
   * Main function to orchestrate the data processing and sorting.
   * This function is invoked once all input data has been received.
   */
  function startOperation() {
    /* Declare local variables for iteration, array bounds, input parsing,
       and the final output string. */
    var elementIndex,
      totalCount, // Represents the count of numbers to process
      rawNumbersText, // The string containing space-separated numbers
      numberTokens, // Array of number strings after splitting
      numericArray = [], // Array to hold parsed integer values
      formattedOutput = ''; // String to build the final sorted result

    // The first line of input specifies the total count of numbers.
    totalCount = Number(incomingData[0]);

    // The second line of input contains the space-separated numbers.
    rawNumbersText = incomingData[1];

    // Split the raw number string into an array of string tokens.
    numberTokens = rawNumbersText.split(' ');

    // Iterate through the tokens and convert them to integers, then store in the numeric array.
    for (elementIndex = 0; elementIndex < totalCount; elementIndex += 1) {
      numericArray.push(Number(numberTokens[elementIndex]));
    }

    // Perform the quick sort operation on the collected numbers.
    divideAndConquerSort(numericArray, 0, totalCount - 1);

    // After sorting, construct the output string with numbers separated by spaces.
    for (elementIndex = 0; elementIndex < totalCount; elementIndex += 1) {
      // Append a space after each number except the last one.
      if (elementIndex !== totalCount - 1) {
        formattedOutput += numericArray[elementIndex] + ' ';
      } else {
        // For the last number, just append the number itself.
        formattedOutput += numericArray[elementIndex];
      }
    }
    // Print the final sorted output to the console.
    console.log(formattedOutput);
  }

  /**
   * Implements the Quicksort algorithm to sort an array of numbers in place.
   * @param {Array<number>} elementList - The array of numbers to be sorted.
   * @param {number} lowerBound - The starting index for the current partition.
   * @param {number} upperBound - The ending index for the current partition.
   */
  function divideAndConquerSort(elementList, lowerBound, upperBound) {
    var rightPointer, // Pointer moving from the right
      leftPointer, // Pointer moving from the left
      comparisonValue, // The pivot element used for partitioning
      temporaryStorage; // Temporary variable for swapping elements

    // Only proceed if the partition has at least two elements.
    if (lowerBound < upperBound) {
      leftPointer = lowerBound;
      rightPointer = upperBound;
      // Select the median of three elements as the pivot to improve performance.
      comparisonValue = selectPivotCandidate(
        elementList[leftPointer],
        elementList[rightPointer],
        elementList[Math.floor((leftPointer + rightPointer) / 2)]
      );

      // Partitioning loop.
      do {
        // Move left pointer until an element greater than or equal to the pivot is found.
        while (elementList[leftPointer] < comparisonValue) {
          leftPointer++;
        }

        // Move right pointer until an element less than or equal to the pivot is found.
        while (elementList[rightPointer] > comparisonValue) {
          rightPointer--;
        }

        // If pointers cross or meet, the partition is complete for this iteration.
        if (leftPointer >= rightPointer) {
          break;
        } else {
          // Swap elements if they are in the wrong partition relative to the pivot.
          temporaryStorage = elementList[leftPointer];
          elementList[leftPointer] = elementList[rightPointer];
          elementList[rightPointer] = temporaryStorage;

          // Move pointers inward after a swap.
          leftPointer++;
          rightPointer--;
        }
      } while (leftPointer <= rightPointer);

      // Recursively sort the left sub-array.
      divideAndConquerSort(elementList, lowerBound, leftPointer - 1);
      // Recursively sort the right sub-array.
      divideAndConquerSort(elementList, rightPointer + 1, upperBound);
    }
  }

  /**
   * Determines the median value among three given numbers.
   * This helps in selecting a better pivot for Quicksort.
   * @param {number} valA - The first number.
   * @param {number} valB - The second number.
   * @param {number} valC - The third number.
   * @returns {number} The median of the three input values.
   */
  function selectPivotCandidate(valA, valB, valC) {
    // Logic to find the median of three values.
    // This expression is a compact way to perform comparisons.
    return (valA <= valB) ?
      ((valB <= valC) ? valB : ((valA < valC) ? valC : valA)) :
      ((valA <= valC) ? valA : ((valB < valC) ? valC : valB));
  }

  // Set up standard input processing.
  process.stdin.resume(); // Ensure the standard input stream is active.
  process.stdin.setEncoding('utf8'); // Set encoding for incoming data.

  // Event listener for incoming data chunks.
  process.stdin.on('data', function(chunkOfData) {
    incomingData += chunkOfData; // Append each chunk to the raw data string.
  });

  // Event listener for the end of the input stream.
  process.stdin.on('end', function() {
    incomingData = incomingData.split('\n'); // Split the accumulated data by newlines.
    startOperation(); // Once all input is received, begin the main processing.
  });

}());