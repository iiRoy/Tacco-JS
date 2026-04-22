"use strict";

/* This script processes an input string to perform
   a series of transformations on an array. */
const processInputData = ( inputString ) => {

  // Split the raw input string into individual lines
  const rawLines = inputString
    .trim()
    .split("\n");

  // Parse the first line to get the total element count and number of transformation cycles
  const [elementCount, numIterations] = rawLines[0]
    .split(" ")
    .map( strValue => parseInt(strValue, 10) );

  // Parse the second line to get the initial array of values
  let currentArray = rawLines[1]
    .split(" ")
    .map( strValue => parseInt(strValue, 10) );

  // Loop through the specified number of transformation cycles
  for ( let iterationIdx = 0; iterationIdx < numIterations; iterationIdx++ ) {

    // Initialize a difference array (deltaArray) for the current cycle
    let deltaArray = new Array( elementCount + 1 ).fill(0);

    // Apply the transformation logic using the difference array technique
    for ( let currentIndex = 0; currentIndex < elementCount; currentIndex++ ) {
      // Calculate the effective left boundary for the current element's influence
      let leftBoundary = Math.max(0, currentIndex - currentArray[currentIndex]);
      // Calculate the effective right boundary for the current element's influence
      let rightBoundary = Math.min(currentIndex + currentArray[currentIndex] + 1, elementCount);

      // Increment at the left boundary and decrement at the right boundary
      deltaArray[leftBoundary]++;
      deltaArray[rightBoundary]--;
    }

    // Convert the difference array into a prefix sum array
    for ( let currentIndex = 0; currentIndex < elementCount; currentIndex++ ) {
      deltaArray[currentIndex + 1] += deltaArray[currentIndex];
    }

    // Check if all elements in the transformed array have reached the maximum possible value (elementCount)
    let isFinished = true;
    for ( let currentIndex = 0; currentIndex < elementCount; currentIndex++ ) {
      if ( deltaArray[currentIndex] !== elementCount ) {
        isFinished = false;
        break;
      }
    }

    // Remove the last auxiliary element from the delta array
    deltaArray.pop();
    // Update the main array with the new transformed values
    currentArray = deltaArray;

    // If the array is uniform (all elements are elementCount), further iterations are unnecessary
    if (isFinished) break;
  }

  // Output the final state of the array, with elements joined by spaces
  console.log(currentArray.join(" "));
};

// Execute the main processing function with input read from standard input
processInputData( require('fs').readFileSync('/dev/stdin', 'utf8') );