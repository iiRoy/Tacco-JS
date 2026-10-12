let numElementsA, numElementsB; // Declare variables for array sizes
let arrayOne = [], arrayTwo = []; // Initialize arrays for holding numbers

/**
 * Performs a binary search for a target value within `arrayTwo`.
 * @param {number} targetValue The value to search for.
 * @returns {boolean} True if the target value is found, false otherwise.
 */
function binaryFind(targetValue) {
  let leftIdx = 0, rightIdx = numElementsB; // Initialize search range boundaries
  while (rightIdx - leftIdx > 1) { // Continue binary search while range is valid
    const midIdx = (leftIdx + rightIdx) >> 1; // Calculate middle index using bit shift for efficiency
    if (arrayTwo[midIdx] <= targetValue) { // If middle element is less than or equal to target
      leftIdx = midIdx; // Move left boundary to middle
    } else { // If middle element is greater than target
      rightIdx = midIdx; // Move right boundary to middle
    }
  }
  return arrayTwo[leftIdx] === targetValue; // Check if the element at leftIdx matches target
}

/**
 * The main program execution function.
 * Reads input, processes arrays, and prints results.
 */
function executeProgram() {
  // Loop as long as there's input for the first array's size
  while ((numElementsA = readNextNumber())) {
    numElementsB = readNextNumber(); // Read the size for the second array

    // Populate arrayOne with numbers from input
    iterateRange(numElementsA, function (currentIdx) {
      arrayOne[currentIdx] = readNextNumber();
    });

    // Populate arrayTwo with numbers from input
    iterateRange(numElementsB, function (currentIdx) {
      arrayTwo[currentIdx] = readNextNumber();
    });

    // Sort both arrays numerically in ascending order
    arrayOne.sort(function (valU, valV) {
      return valU - valV;
    });
    arrayTwo.sort(function (valU, valV) {
      return valU - valV;
    });

    let sumA = 0; // Initialize sum for arrayOne
    // Calculate the sum of elements in arrayOne
    iterateRange(numElementsA, function (currentIdx) {
      sumA += arrayOne[currentIdx];
    });

    let sumB = 0; // Initialize sum for arrayTwo
    // Calculate the sum of elements in arrayTwo
    iterateRange(numElementsB, function (currentIdx) {
      sumB += arrayTwo[currentIdx];
    });

    // Calculate the required difference for a swap
    const differenceHalf = Math.floor((sumB - sumA) / 2);

    // Check if the total difference is an odd number (no integer solution possible)
    if (sumB - sumA !== 2 * differenceHalf) {
      outputValue(-1); // If not even, no solution, print -1
    } else { // If difference is even, proceed to find a pair
      let foundPair = false; // Flag to indicate if a suitable pair is found

      // Iterate through arrayOne to find a number that, when swapped, balances the sums
      iterateRange(numElementsA, function (currentIdx) {
        // Search for a value in arrayTwo that would balance the sums if swapped
        if (binaryFind(arrayOne[currentIdx] + differenceHalf)) {
          outputValue(arrayOne[currentIdx] + ' ' + (arrayOne[currentIdx] + differenceHalf)); // Print the pair
          foundPair = true; // Set flag to true
          return false; // Stop iteration if a pair is found
        }
      });

      // If no pair was found after checking all elements in arrayOne
      if (!foundPair) {
        outputValue(-1); // Print -1
      }
    }

    // Clear arrays for the next set of inputs
    arrayOne = [];
    arrayTwo = [];
  }
}

/**
 * A generic iteration function.
 * Can be called with (end, callback) or (start, end, callback).
 * @param {number} startVal The starting index (or end if only two args).
 * @param {number} endVal The ending index (exclusive) or callback if two args.
 * @param {Function} callbackFn The function to call for each iteration.
 */
function iterateRange(startVal, endVal, callbackFn) {
  // Adjust arguments if only two are provided (assuming start from 0)
  if (callbackFn === undefined) {
    callbackFn = endVal;
    endVal = startVal;
    startVal = 0;
  }
  // Loop from startVal up to (but not including) endVal
  for (let currentIdx = startVal; currentIdx < endVal; ++currentIdx) {
    // Execute callback; break loop if callback returns false
    if (callbackFn(currentIdx) === false) {
      break;
    }
  }
}

let rawDataBuffer = ''; // Buffer to store incoming stdin data

/**
 * Reads and parses the next number from the processed input buffer.
 * @returns {number} The next number.
 */
function readNextNumber() {
  return +rawDataBuffer.pop(); // Pop the last element and convert to number
}

/**
 * Reads the next string from the processed input buffer.
 * @returns {string} The next string.
 */
function readNextString() {
  return rawDataBuffer.pop(); // Pop the last element (which is a string)
}

/**
 * Prints a value to the console.
 * @param {*} data The value to print.
 */
function outputValue(data) {
  console.log(data);
}

// Set up stdin processing
process.stdin.resume(); // Keep stdin open
process.stdin.setEncoding('utf8'); // Set encoding for stdin

// Event listener for incoming data chunks
process.stdin.on('data', function (dataChunk) {
  rawDataBuffer += dataChunk; // Append data to the buffer
});

// Event listener for end of input stream
process.stdin.on('end', function () {
  // Process the raw input: trim whitespace, split by any whitespace, and reverse
  // Reversing allows `pop()` to retrieve elements in their original order
  rawDataBuffer = rawDataBuffer.trim().split(/\s+/).reverse();
  executeProgram(); // Start the main program logic
});
