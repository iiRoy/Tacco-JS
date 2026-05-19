"use strict";

/**
 * Orchestrates the primary logic to determine if an input string can be
 * constructed by reversing and concatenating a specific set of words.
 * @param {string} initialString The string provided for analysis.
 */
function ProcessInput(initialString) {
  // A collection of predefined words that will be used for matching.
  const wordList = ["dream", "dreamer", "erase", "eraser"];

  // Iterate through the word collection and reverse each word in place.
  for (let idx in wordList) {
    wordList[idx] = flipString(wordList[idx]);
  }

  // Reverse the entire input string once at the beginning of the process.
  initialString = flipString(initialString);

  // Begin an iterative process to consume parts of the reversed input string.
  while (true) {
    let matchCount = 0; // Tracks how many words from the list have been checked in the current iteration.

    // Loop through each reversed word in our predefined collection.
    for (let currentWord of wordList) {
      // Extract a segment from the start of the current input string,
      // matching the length of the current word from our list.
      var extractedSegment = initialString.slice(0, currentWord.length);

      // Check if the extracted segment perfectly matches the current reversed word.
      if (extractedSegment === currentWord) {
        // If a match is found, remove the matched portion from the input string.
        initialString = initialString.substr(currentWord.length);
        break; // Exit this inner loop as a successful match was made.
      }
      matchCount++; // Increment the counter if no match was found with the current word.
    }

    // If all words in the `wordList` have been checked (matchCount > 3 for 4 words)
    // and no match was found, it means the input string cannot be further decomposed.
    if (matchCount > 3) {
      break; // Terminate the main processing loop.
    }
  }

  // After the loop concludes, check if the entire input string has been consumed.
  if (initialString === "") {
    console.log("YES"); // If empty, the string can be formed.
  } else {
    console.log("NO"); // Otherwise, it cannot.
  }
}

/**
 * Utility function to reverse the characters of a given string.
 * @param {string} originalText The string to be reversed.
 * @returns {string} The string with its characters in reverse order.
 */
function flipString(originalText) {
  // Convert the string to an array of characters, reverse the array, then join back into a string.
  return originalText.split("").reverse().join("");
}

// Read the input from standard input (e.g., a file or piped data)
// and initiate the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf-8"));
