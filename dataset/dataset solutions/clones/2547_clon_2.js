"use strict";

// This script reads input from standard input, processes it, and prints a result.

const inputContent = require('fs').readFileSync('/dev/stdin', 'UTF-8'); // Read all input as a string
const inputLines = inputContent.split('\n'); // Split the input string into an array of lines

const firstLineParts = inputLines[0].split(' '); // Parse the first line for N and K
const permutationElements = inputLines[1].split(' '); // Parse the second line for the array P

const totalCount = parseInt(firstLineParts[0]); // Convert the first part of the first line to an integer (N)
const segmentLength = parseInt(firstLineParts[1]); // Convert the second part of the first line to an integer (K)

let uniquePermutations = {}; // Initialize an object to store unique permutations as keys
let iterationIndex = 0; // Initialize a counter for the sliding window

// Loop indefinitely until a break condition is met
while (true) {
  // Check if the current window exceeds the array bounds
  if (iterationIndex + segmentLength > permutationElements.length) {
    break; // Exit the loop if the window goes out of bounds
  }

  // Extract the segment before the current window
  const prefixSegment = permutationElements.slice(0, iterationIndex);
  // Extract the current window segment and sort it lexicographically
  const middleSortedSegment = permutationElements.slice(iterationIndex, iterationIndex + segmentLength).sort((valA, valB) => valA > valB);
  // Extract the segment after the current window
  const suffixSegment = permutationElements.slice(iterationIndex + segmentLength);

  // Concatenate the three segments to form a new permutation
  const currentPermutation = prefixSegment.concat(middleSortedSegment).concat(suffixSegment);

  // Add the new permutation to the object as a key to ensure uniqueness
  uniquePermutations[currentPermutation] = true;

  // Move the window forward by one position
  iterationIndex++;
}

// Print the total number of unique permutations found
console.log(Object.keys(uniquePermutations).length);
