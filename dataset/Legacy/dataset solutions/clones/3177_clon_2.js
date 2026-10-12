"use strict";

/**
 * Main entry point for processing the input data.
 * This function orchestrates the parsing, calculation, and output.
 * @param {string} rawInputData - The entire input content as a single string.
 */
function ProcessInput(rawInputData) {
  // Split the input string by any whitespace and convert each part to an integer.
  let parsedNumbersArray = rawInputData.split(/\s+/);
  for (let currentIdx = 0; currentIdx < parsedNumbersArray.length; currentIdx++) {
    parsedNumbersArray[currentIdx] = parseInt(parsedNumbersArray[currentIdx], 10);
  }

  // Extract the initial counts for shrines, temples, and queries.
  const shrineCount = parsedNumbersArray.shift(); // Number of shrine locations
  const templeCount = parsedNumbersArray.shift(); // Number of temple locations
  const queryCount = parsedNumbersArray.shift(); // Number of query points

  // Separate the arrays for shrine locations, temple locations, and query points.
  const shrineLocations = parsedNumbersArray.splice(0, shrineCount); // Array of shrine coordinates
  const templeLocations = parsedNumbersArray.splice(0, templeCount); // Array of temple coordinates
  const queryPoints = parsedNumbersArray; // Remaining numbers are the query coordinates

  // Sort the query points while retaining their original indices.
  // This custom function performs an insertion sort to maintain order and track origins.
  const indexedSortedQueries = performIndexedInsertionSort(queryPoints);

  // Arrays to store the closest shrine/temple locations for each query point.
  // 'Before' refers to the largest location less than or equal to the query.
  // 'After' refers to the smallest location greater than or equal to the query.
  const closestShrineBefore = [];
  const closestShrineAfter = [];
  const closestTempleBefore = [];
  const closestTempleAfter = [];

  // Pointers to efficiently traverse the sorted shrine and temple arrays.
  let currentShrinePtr = 0;
  let currentTemplePtr = 0;

  // Pre-calculate the nearest shrines and temples for each query point.
  for (let qIndex = 0; qIndex < queryCount; qIndex++) {
    // Advance shrine pointer until it points to a shrine >= current query value.
    while (shrineLocations[currentShrinePtr] < indexedSortedQueries[qIndex][0]) {
      currentShrinePtr++;
    }
    // Store the shrine just before and just after the query point.
    // Use extremely large/small values if no such shrine exists (boundary conditions).
    closestShrineBefore[qIndex] = (shrineLocations[currentShrinePtr - 1] || -100000000000000); // Equivalent to -1e14
    closestShrineAfter[qIndex] = (shrineLocations[currentShrinePtr] || 100000000000000); // Equivalent to 1e14

    // Advance temple pointer until it points to a temple >= current query value.
    while (templeLocations[currentTemplePtr] < indexedSortedQueries[qIndex][0]) {
      currentTemplePtr++;
    }
    // Store the temple just before and just after the query point.
    // Use extremely large/small values for boundary conditions.
    closestTempleBefore[qIndex] = (templeLocations[currentTemplePtr - 1] || -1000000000000000); // Equivalent to -1e15
    closestTempleAfter[qIndex] = (templeLocations[currentTemplePtr] || 1000000000000000); // Equivalent to 1e15
  }

  // Array to store the final minimum distances for each query.
  const finalDistances = [];

  // Calculate the minimum travel distance for each query point.
  for (let qIndex = 0; qIndex < queryCount; qIndex++) {
    // Retrieve the original index and the actual value of the current query point.
    const originalQueryIndex = indexedSortedQueries[qIndex][1];
    const currentQueryValue = indexedSortedQueries[qIndex][0];

    // Get the pre-calculated closest shrine and temple values for this query.
    const sBefore = closestShrineBefore[qIndex]; // Shrine before query
    const sAfter = closestShrineAfter[qIndex];   // Shrine after query
    const tBefore = closestTempleBefore[qIndex]; // Temple before query
    const tAfter = closestTempleAfter[qIndex];   // Temple after query

    // Create a local alias for Math.abs for conciseness.
    const absoluteDifference = Math.abs;

    // Calculate the minimum distance by considering all 8 possible paths:
    // (Query -> Shrine -> Temple) or (Query -> Temple -> Shrine)
    // using combinations of 'before' and 'after' locations.
    finalDistances[originalQueryIndex] = Math.min(
      absoluteDifference(sAfter - currentQueryValue) + absoluteDifference(tAfter - sAfter), // Q -> sA -> tA
      absoluteDifference(sAfter - currentQueryValue) + absoluteDifference(tBefore - sAfter), // Q -> sA -> tB
      absoluteDifference(sBefore - currentQueryValue) + absoluteDifference(tAfter - sBefore), // Q -> sB -> tA
      absoluteDifference(sBefore - currentQueryValue) + absoluteDifference(tBefore - sBefore), // Q -> sB -> tB
      absoluteDifference(tAfter - currentQueryValue) + absoluteDifference(sAfter - tAfter), // Q -> tA -> sA
      absoluteDifference(tAfter - currentQueryValue) + absoluteDifference(sBefore - tAfter), // Q -> tA -> sB
      absoluteDifference(tBefore - currentQueryValue) + absoluteDifference(sAfter - tBefore), // Q -> tB -> sA
      absoluteDifference(tBefore - currentQueryValue) + absoluteDifference(sBefore - tBefore)  // Q -> tB -> sB
    ).toString(10); // Convert the minimum distance to a string.
  }

  // Output the results, each on a new line, ensuring a trailing newline character.
  console.log(finalDistances.join("\n").trim() + '\n');
}

/**
 * Sorts an array of numbers while preserving their original indices.
 * This function implements an insertion sort algorithm, using binary search
 * to find the correct insertion point for each element.
 * @param {number[]} inputArray - The array of numbers to be sorted.
 * @returns {Array<[number, number]>} An array of [value, originalIndex] pairs, sorted by value.
 */
function performIndexedInsertionSort(inputArray) {
  const inputLength = inputArray.length;
  // Initialize the sorted array with the first element and its index.
  const sortedValueIndexPairs = [[inputArray[0], 0]];

  // Iterate through the remaining elements of the input array.
  for (let currentElementIndex = 1; currentElementIndex < inputLength; currentElementIndex++) {
    let searchUpperBound = sortedValueIndexPairs.length - 1;
    let searchLowerBound = 0;
    let searchMiddleIndex = Math.floor((searchLowerBound + searchUpperBound) / 2);

    // Perform a binary search to find the correct position for the current element.
    while (!(searchLowerBound > searchUpperBound)) {
      if (sortedValueIndexPairs[searchMiddleIndex][0] < inputArray[currentElementIndex]) {
        searchLowerBound = searchMiddleIndex + 1;
      } else {
        searchUpperBound = searchMiddleIndex - 1;
      }
      searchMiddleIndex = Math.floor((searchLowerBound + searchUpperBound) / 2);
    }
    // Insert the current element and its original index into the sorted array.
    sortedValueIndexPairs.splice(searchMiddleIndex + 1, 0, [inputArray[currentElementIndex], currentElementIndex]);
  }
  return sortedValueIndexPairs;
}

// Read the entire content from standard input and pass it to the main processing function.
ProcessInput(require('fs').readFileSync("/dev/stdin", "utf8"));
