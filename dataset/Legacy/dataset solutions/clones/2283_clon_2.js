"use strict";

// This function orchestrates the main logic for processing input and calculating the result.
function processInput(inputString) {
  // Split the input string into individual lines, removing leading/trailing whitespace.
  const inputLines = inputString.trim().split("\n");

  // Extract the first array of numbers from the second line.
  let firstPermArray = inputLines[1].split(" ");

  // Extract the second array of numbers from the third line.
  let secondPermArray = inputLines[2].split(" ");

  // Generate all possible permutations of the first array.
  // The length of the permutation is the same as the array's length.
  const allPermutations = generatePermutations(firstPermArray, firstPermArray.length);

  // Convert the first array into a single string for comparison.
  const firstPermString = firstPermArray.join("");

  // Convert the second array into a single string for comparison.
  const secondPermString = secondPermArray.join("");

  // Initialize variables to store the indices of the target permutations.
  let firstPermIndex;
  let secondPermIndex;

  // Convert each permutation (which is an array of strings) into a single string.
  for (let permIdx = 0; permIdx < allPermutations.length; permIdx++) {
    allPermutations[permIdx] = allPermutations[permIdx].join("");
  }

  // Sort the list of all permutation strings lexicographically.
  allPermutations.sort();

  // Iterate through the sorted permutations to find the indices of the target strings.
  for (let currentPermIdx = 0; currentPermIdx < allPermutations.length; currentPermIdx++) {
    if (firstPermString === allPermutations[currentPermIdx]) {
      firstPermIndex = currentPermIdx;
    }
    if (secondPermString === allPermutations[currentPermIdx]) {
      secondPermIndex = currentPermIdx;
    }
  }

  // Output the absolute difference between the found indices.
  console.log(Math.abs(firstPermIndex - secondPermIndex));
}

// This recursive function generates all permutations of a given array of elements.
function generatePermutations(elements, lengthOfPermutation) {
  const resultPerms = []; // Stores the generated permutations.

  // Base case: If the desired permutation length is greater than the number of elements,
  // no permutations can be formed.
  if (elements.length < lengthOfPermutation) {
    return [];
  }

  // Base case: If the desired permutation length is 1, each element is a permutation itself.
  if (lengthOfPermutation === 1) {
    for (let elemIndex = 0; elemIndex < elements.length; elemIndex++) {
      resultPerms[elemIndex] = [elements[elemIndex]];
    }
  } else {
    // Recursive step: For each element, consider it as the first element of a permutation,
    // then find permutations of the remaining elements.
    for (let currentElemIndex = 0; currentElemIndex < elements.length; currentElemIndex++) {
      // Create a copy of the elements array.
      const remainingElements = elements.slice(0);
      // Remove the current element from the copied array.
      remainingElements.splice(currentElemIndex, 1)[0];

      // Recursively find permutations of the remaining elements with a reduced length.
      const subPermutations = generatePermutations(remainingElements, lengthOfPermutation - 1);

      // Prepend the current element to each sub-permutation and add to the results.
      for (let subPermIndex = 0; subPermIndex < subPermutations.length; subPermIndex++) {
        resultPerms.push([elements[currentElemIndex]].concat(subPermutations[subPermIndex]));
      }
    }
  }

  return resultPerms;
}

// Execute the main processing function by reading input from stdin.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
