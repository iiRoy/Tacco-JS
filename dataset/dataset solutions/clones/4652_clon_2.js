"use strict";

// This function processes the input data to find common characters.
const processInput = (inputData) => {
  // Trim whitespace and split the input into lines.
  inputData = inputData.trim().split("\n");

  // The first line contains the number of strings.
  const numStrings = parseInt(inputData[0]);

  // The subsequent lines are the strings to analyze.
  const stringArray = inputData.slice(1, numStrings + 1);

  // Define the set of characters to check (lowercase English alphabet).
  const charSet = "abcdefghijklmnopqrstuvwxyz".split("");

  // Initialize an array to store the resulting common characters.
  let resultChars = [];

  // Iterate through each character in the defined character set.
  for (let charIndex in charSet) {
    // Initialize the minimum occurrences for the current character to a very large number.
    let minOccurrences = Number.POSITIVE_INFINITY; // Using Number.POSITIVE_INFINITY for clarity

    // Iterate through each string in the input array.
    for (let strIndex in stringArray) {
      // Count how many times the current character appears in the current string.
      let currentCount = stringArray[strIndex]
        .split("")
        .filter((charToCheck) => charToCheck === charSet[charIndex]).length;

      // If the character is found in the current string, update the minimum occurrences.
      if (currentCount > 0) {
        minOccurrences = Math.min(currentCount, minOccurrences);
      } else {
        // If the character is not found in any string, its minimum occurrence is 0,
        // so we can stop checking this character for other strings.
        minOccurrences = 0;
        break;
      }
    }

    // Append the current character to the result array 'minOccurrences' times.
    for (let k = 0; k < minOccurrences; k++) {
      resultChars.push(charSet[charIndex]);
    }
  }

  // Join the resulting characters and print the final string to the console.
  console.log(resultChars.join(""));
};

// Read input from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
