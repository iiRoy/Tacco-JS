"use strict"; /* Strict mode enabled for cleaner code execution */

/**
 * Locates the appropriate insertion point for a target element within a sorted collection.
 * This function performs a binary search-like operation to find an index.
 * @param {Array<number>} sortedCollection The array of numbers to search within.
 * @param {number} targetElement The numeric value to find or determine the position for.
 * @returns {number} The index where the target element is found or should be inserted.
 */
function findInsertionPoint(sortedCollection, targetElement) {
  let lowerBound = 0; // Initialize the lower boundary of the search range
  let upperBound = sortedCollection.length - 1; // Initialize the upper boundary
  let midIndex = Math.floor((lowerBound + upperBound) / 2); // Calculate initial middle index

  // Loop while the element at midIndex is not the target and the search range is valid
  while (sortedCollection[midIndex] !== targetElement && lowerBound < upperBound) {
    if (targetElement < sortedCollection[midIndex]) {
      // If target is smaller, adjust the upper boundary
      upperBound = midIndex - 1;
    } else {
      // If target is larger, adjust the lower boundary
      lowerBound = midIndex + 1;
    }
    // Recalculate the middle index for the new search range
    midIndex = Math.floor((lowerBound + upperBound) / 2);
  }

  // After the loop, determine the final insertion point
  // If the element at midIndex is greater than the target, return midIndex
  if (sortedCollection[midIndex] > targetElement) return midIndex;
  // If the element at midIndex is less than the target, return midIndex + 1
  if (sortedCollection[midIndex] < targetElement) return midIndex + 1;
  // If the element at midIndex is not equal to target, return midIndex + 1 (for insertion after), else midIndex
  return (sortedCollection[midIndex] !== targetElement) ? midIndex + 1 : midIndex;
}

/**
 * Main execution function for processing input data and calculating distances.
 * @param {string} rawData The raw string input containing various parameters and lists.
 */
function ProcessInputData(rawData) {
  const MAX_LIMIT = Number.MAX_SAFE_INTEGER; // Define a very large number constant
  let inputLines = rawData.split("\n"); // Split the input string into an array of lines

  // Parse the first line to get counts for lists A, B, and number of queries Q
  let paramsCount = inputLines.shift().split(/\s/).map((val) => +val);
  let countOfAValues = paramsCount[0]; // Number of elements for list 'sList'
  let countOfBValues = paramsCount[1]; // Number of elements for list 'tList'
  let numberOfQueries = paramsCount[2]; // Number of queries to process

  // Initialize and populate the 'sList' (shrines) with sentinel values
  let sList = [-MAX_LIMIT]; // Add a negative infinity sentinel at the start
  for (let idxA = 1; idxA <= countOfAValues; idxA++) {
    sList.push(+(inputLines.shift())); // Add shrine locations, converting to number
  }
  sList.push(MAX_LIMIT); // Add a positive infinity sentinel at the end

  // Initialize and populate the 'tList' (temples) with sentinel values
  let tList = [-MAX_LIMIT]; // Add a negative infinity sentinel at the start
  for (let idxB = 1; idxB <= countOfBValues; idxB++) {
    tList.push(+(inputLines.shift())); // Add temple locations, converting to number
  }
  tList.push(MAX_LIMIT); // Add a positive infinity sentinel at the end

  /**
   * Helper function to find the minimum of three numbers.
   * @param {number} val1 First number.
   * @param {number} val2 Second number.
   * @param {number} val3 Third number.
   * @returns {number} The smallest of the three numbers.
   */
  const getMinOfThree = (val1, val2, val3) => {
    return Math.min(val1, Math.min(val2, val3));
  };

  // Process each query
  for (let queryIndex = 0; queryIndex < numberOfQueries; queryIndex++) {
    let currentQueryValue = +(inputLines.shift()); // Get the current query location

    // Find insertion points in sList and tList for the current query value
    let posInS = findInsertionPoint(sList, currentQueryValue);
    let posInT = findInsertionPoint(tList, currentQueryValue);

    let minimumCalculatedDistance = MAX_LIMIT; // Initialize minimum distance for this query

    // Iterate through relevant shrine locations around the insertion point
    for (let selectedShrine of [sList[posInS - 1], sList[posInS]]) {
      // Iterate through relevant temple locations around the insertion point
      for (let selectedTemple of [tList[posInT - 1], tList[posInT]]) {
        // Calculate two possible distance scenarios
        // Scenario 1: Go from query to shrine, then shrine to temple
        const firstDistanceScenario = Math.abs(selectedShrine - currentQueryValue) + Math.abs(selectedTemple - selectedShrine);
        // Scenario 2: Go from query to temple, then temple to shrine
        const secondDistanceScenario = Math.abs(selectedTemple - currentQueryValue) + Math.abs(selectedShrine - selectedTemple);
        // Update the minimum distance with the smallest of the current minimum and the two scenarios
        minimumCalculatedDistance = getMinOfThree(minimumCalculatedDistance, firstDistanceScenario, secondDistanceScenario);
      }
    }
    console.log(minimumCalculatedDistance); // Output the calculated minimum distance for the query
  }
}

// Execute the main program with input from standard input
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));