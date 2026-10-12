"use strict";

// This function processes the input data to determine if two strings
// are anagrams based on character frequency counts.
const solveProblem = (inputData) => {
  // Trim leading/trailing whitespace and split the input into lines.
  let processedLines = inputData.trim().split("\n");

  // Extract the two strings from the processed input.
  const stringOne = processedLines[0];
  const stringTwo = processedLines[1];

  // Initialize two arrays to store character frequencies.
  // Each array has 26 elements, one for each lowercase English letter,
  // initialized to zero.
  const frequencyMapA = [...Array(26)].fill(0);
  const frequencyMapB = [...Array(26)].fill(0);

  // Iterate through the characters of the first string (assuming both have same length).
  for (let charIndex = 0; charIndex < stringOne.length; charIndex++) {
    // Increment the count for the corresponding character in frequencyMapA.
    // 'a' has char code 97, so subtracting 97 gives 0 for 'a', 1 for 'b', etc.
    frequencyMapA[stringOne.charCodeAt(charIndex) - 97]++;
    // Do the same for the second string in frequencyMapB.
    frequencyMapB[stringTwo.charCodeAt(charIndex) - 97]++;
  }

  // Sort both frequency maps in ascending order.
  // This ensures that if the strings are anagrams, their sorted frequency maps will be identical.
  frequencyMapA.sort((valA, valB) => valA - valB);
  frequencyMapB.sort((valA, valB) => valA - valB);

  // Compare the sorted frequency maps by converting them to strings.
  // If they are identical, the original strings are "character-frequency-equivalent".
  if (frequencyMapA.join("") === frequencyMapB.join("")) {
    console.log("Yes"); // Output "Yes" if they match.
  } else {
    console.log("No"); // Output "No" otherwise.
  }
};

// Read the input from standard input and pass it to the solver function.
solveProblem(require('fs').readFileSync('/dev/stdin', 'utf8'));
