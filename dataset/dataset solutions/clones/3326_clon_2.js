'use strict'; // Enforce strict mode for better code quality and error handling.

(function(rawInputData) {
  // Pre-process the raw input string:
  // 1. Remove leading/trailing whitespace.
  // 2. Split the string into an array of substrings based on one or more whitespace characters.
  // 3. Convert each substring to a number using the `x => x - 0` trick.
  rawInputData = rawInputData.trim().split(/\s+/).map(currentValue => currentValue - 0);

  // Extract the total number of elements (N) from the beginning of the processed input array.
  const totalElements = rawInputData.shift();

  // Initialize an array to store the frequency of different item types.
  // Index 0 is unused, as item types are typically 1, 2, or 3.
  const itemFrequency = ['zero', 0, 0, 0];

  // Iterate through the remaining input values and increment the count for each item type.
  rawInputData.forEach(function(currentValue) {
    itemFrequency[currentValue]++;
  });

  // Declare and initialize a 3D array for dynamic programming calculations.
  // The dimensions are slightly larger (N+2) to handle boundary conditions gracefully.
  const dynamicProgrammingTable = new Array(totalElements + 2);

  // Populate the 3D table structure and set initial values.
  // The loops run from -1 to totalElements + 1 to cover all required indices.
  for (let dimA = -1; dimA < totalElements + 2; dimA++) {
    dynamicProgrammingTable[dimA] = new Array(totalElements + 2 - dimA);
    for (let dimB = -1; dimB < totalElements + 2 - dimA; dimB++) {
      // Initialize the innermost array with zeros.
      dynamicProgrammingTable[dimA][dimB] = new Array(totalElements + 2 - dimA - dimB).fill(0);
      // Set a specific boundary condition for the innermost dimension at index -1.
      dynamicProgrammingTable[dimA][dimB][-1] = 0;
    }
  }

  // Perform the core dynamic programming computations.
  // These nested loops calculate expected values based on a recurrence relation.
  for (let dimA = 1; dimA <= totalElements; dimA++) {
    // Calculate the base case for the first dimension (dimA, 0, 0).
    dynamicProgrammingTable[dimA][0][0] = dynamicProgrammingTable[dimA - 1][0][0] + (totalElements / dimA);

    for (let dimB = 1; dimB <= dimA; dimB++) {
      // Calculate values for two dimensions (dimA - dimB, dimB, 0).
      dynamicProgrammingTable[dimA - dimB][dimB][0] =
        totalElements / dimA +
        dynamicProgrammingTable[dimA - dimB + 1][dimB - 1][0] * (dimB / dimA) +
        dynamicProgrammingTable[dimA - dimB - 1][dimB][0] * ((dimA - dimB) / dimA);

      for (let dimC = 1; dimC <= dimB; dimC++) {
        // Calculate values for all three dimensions (dimA - dimB, dimB - dimC, dimC).
        dynamicProgrammingTable[dimA - dimB][dimB - dimC][dimC] =
          totalElements / dimA +
          dynamicProgrammingTable[dimA - dimB][dimB - dimC + 1][dimC - 1] * (dimC / dimA) +
          dynamicProgrammingTable[dimA - dimB + 1][dimB - 1 - dimC][dimC] * ((dimB - dimC) / dimA) +
          dynamicProgrammingTable[dimA - dimB - 1][dimB - dimC][dimC] * ((dimA - dimB) / dimA);
      }
    }
  }

  // Output the final result from the dynamic programming table.
  // The indices are determined by the frequencies of item types 1, 2, and 3.
  console.log(dynamicProgrammingTable[itemFrequency[1]][itemFrequency[2]][itemFrequency[3]]);

})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Immediately invoke the function with input read from standard input.
