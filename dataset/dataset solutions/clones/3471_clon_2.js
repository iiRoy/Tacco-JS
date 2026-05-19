var dataStore; // Global array to hold numerical values for processing.

/**
 * Processes two elements within the global dataStore array based on their indices.
 * This function modifies the values in dataStore according to a specific algorithm.
 *
 * @param {number} idxA - The first index for operations.
 * @param {number} idxB - The second index for operations.
 */
function processValues(idxA, idxB) {
  // Check if the value at the first index is odd.
  // If it is, decrement it by one to make it even.
  if (dataStore[idxA] % 2 === 1) {
    --dataStore[idxA];
  }

  // Divide the value at the first index by two.
  dataStore[idxA] /= 2;

  // Add the (potentially modified) value from the first index to the value at the second index.
  dataStore[idxB] += dataStore[idxA];
}

/**
 * The primary entry point for the application.
 * It reads input, initializes the dataStore, performs a series of operations,
 * and then outputs the final state of specific elements.
 *
 * @param {string} rawData - The raw input string, typically from standard input.
 */
function EntryFunction(rawData) {
    // Parse the input string:
    // 1. Split by newline, take the first line.
    // 2. Split that line by whitespace.
    // 3. Convert each resulting string segment into a number.
    dataStore = rawData.split("\n")[0].split(/\s/).map(function(numStr) {
        return numStr - 0; // Convert string to number.
    });

    // Extract the number of iterations from the third element of the parsed data.
    var iterationsCount = dataStore[2];

    // Loop a specified number of times, performing operations based on the loop counter's parity.
    for (var loopCounter = 1; loopCounter <= iterationsCount; loopCounter++) {
      // If the current loop iteration is odd, call processValues with indices 0 and 1.
      if (loopCounter % 2 === 1) {
        processValues(0, 1);
      }
      // Otherwise (if the iteration is even), call processValues with indices 1 and 0.
      else {
        processValues(1, 0);
      }
    }

    // Output the final values of the first two elements of the dataStore.
    console.log('%d %d', dataStore[0], dataStore[1]);
}

// Read input from standard input and pass it to the main entry function.
EntryFunction(require("fs").readFileSync("/dev/stdin", "utf8"));
