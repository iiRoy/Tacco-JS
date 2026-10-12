"use strict";

// This function processes the given input data to find a specific substring.
const processInput = (inputData) => {
  // Clean up the input string and split it into lines.
  inputData = inputData.trim().split("\n");

  // Extract the main string from the first line.
  const inputString = inputData[0];
  // Determine the length of the main string.
  const stringLength = inputString.length;
  // Parse the target count 'k' from the second line.
  const targetCount = parseInt(inputData[1]);

  // Get all unique characters from the input string, sort them alphabetically.
  const uniqueChars = [...new Set(inputString.split(""))].sort();
  // Initialize an index to iterate through the unique characters.
  let charIndex = 0;
  // Create a Set to store unique substrings found.
  const substringSet = new Set();

  // Loop until the desired number of unique substrings (targetCount) is found.
  while (substringSet.size < targetCount) {
    // Iterate through each character of the input string.
    for (let outerLoopIdx = 0; outerLoopIdx < stringLength; outerLoopIdx++) {
      let innerLoopLen = 1; // Start with a substring length of 1.

      // Check if the current character matches the character at charIndex from uniqueChars.
      // If not, skip to the next character in the input string.
      if (
        inputString.slice(outerLoopIdx, outerLoopIdx + innerLoopLen) !==
        uniqueChars[charIndex]
      ) {
        continue;
      }

      // While the substring is within bounds and its length is not more than 5.
      while (
        outerLoopIdx + innerLoopLen <= stringLength &&
        innerLoopLen <= 5
      ) {
        // Add the current substring to our set of unique substrings.
        substringSet.add(
          inputString.slice(outerLoopIdx, outerLoopIdx + innerLoopLen)
        );
        // Increment the substring length for the next iteration.
        innerLoopLen += 1;
      }
    }

    // Move to the next unique character for the next outer loop iteration.
    charIndex++;
  }

  // Convert the set of substrings to an array, sort it, and get the (targetCount - 1)-th element.
  const finalResult = [...substringSet].sort()[targetCount - 1];
  // Print the final result to the console.
  console.log(finalResult);
};

// Read input from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
