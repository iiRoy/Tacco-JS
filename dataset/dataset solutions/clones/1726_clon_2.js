"use strict"; // Enforce strict parsing and error handling rules for the script

// A factory function to produce an input stream handler object
const constructDataStream = () => {
  // Read all data from standard input, decode as UTF-8, trim whitespace, and split into individual lines
  const rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
  // Configure and return the data stream manager object
  const dataStream = {
    "dataItems": rawData, // Stores the array of processed input lines
    "currentItemIndex": 0, // Tracks the current position in the data items array
    "totalItems": rawData.length, // The total count of available data items
    // Method to determine if there are more elements left to be read
    "hasMoreElements": function() {
      return this.currentItemIndex < this.totalItems;
    },
    // Method to fetch the next data element from the stream
    "getNextElement": function() {
      if (!this.hasMoreElements()) {
        // Raise an error if an attempt is made to access data beyond available bounds
        throw "InputOutOfBoundsError"; // Custom error message
      } else {
        // Retrieve the element at the current index and then advance the index
        return this.dataItems[this.currentItemIndex++];
      }
    }
  };
  return dataStream;
};

// Instantiate the global input reader object using the factory function
const readerObject = constructDataStream();

// Convenient helper aliases for common input operations
const fetchNextItem = () => readerObject.getNextElement();
const fetchNextInteger = () => parseInt(readerObject.getNextElement());
const fetchNextStringArray = () => readerObject.getNextElement().split(" ");
const fetchNextIntegerArray = () => readerObject.getNextElement().split(" ").map(elementValue => parseInt(elementValue));
const fetchNextCharacterArray = () => readerObject.getNextElement().split("");
const checkHasMore = () => readerObject.hasMoreElements();

// A generalized utility function for logging output to the console
const displayOutput = (...outputValues) => console.log(...outputValues);

// The core function encapsulating the primary business logic
const ExecutePrincipalLogic = () => {
  // Extract three integer parameters (N, M, K) from the first line of input
  let [numItemsA, numItemsB, maxBudget] = fetchNextIntegerArray();
  // Read two separate arrays of integers, 'arrayA' and 'arrayB'
  let arrayA = fetchNextIntegerArray();
  let arrayB = fetchNextIntegerArray();

  // Compute prefix sums (cumulative sums) for arrayA
  let cumulativeSumsA = [0]; // Start with 0 to represent sum before any elements
  for (let idxA = 0; idxA < arrayA.length; idxA++) {
    cumulativeSumsA.push(cumulativeSumsA[idxA] + arrayA[idxA]);
  }

  // Compute prefix sums (cumulative sums) for arrayB
  let cumulativeSumsB = [0]; // Initialize with 0 for the prefix sum array
  for (let idxB = 0; idxB < arrayB.length; idxB++) {
    cumulativeSumsB.push(cumulativeSumsB[idxB] + arrayB[idxB]);
  }

  // Initialize a variable to track the maximum combined count of items
  let maxCombinedCount = 0;

  // Use a two-pointer approach to find the maximum combination
  // 'idxA' iterates through possible counts from arrayA, 'idxB' adjusts for arrayB
  for (let idxA = 0, idxB = numItemsB; idxA <= numItemsA; idxA++) {
    // If the current sum from arrayA alone exceeds the budget,
    // then any further increase in 'idxA' will also exceed, so terminate.
    if (cumulativeSumsA[idxA] > maxBudget) {
      break;
    }
    // While the combined sum of items from arrayA (up to idxA) and arrayB (up to idxB)
    // surpasses the allocated budget, decrease 'idxB' to reduce the sum from arrayB.
    while (cumulativeSumsA[idxA] + cumulativeSumsB[idxB] > maxBudget) {
      idxB--;
    }
    // Update 'maxCombinedCount' with the larger value between the current max
    // and the sum of current indices (representing total items selected).
    maxCombinedCount = Math.max(maxCombinedCount, idxA + idxB);
  }
  // Display the final computed maximum combined count to standard output
  console.log(maxCombinedCount);
};

// Invoke the main program logic to begin execution
ExecutePrincipalLogic();