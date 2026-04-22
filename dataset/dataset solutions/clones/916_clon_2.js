/*
 * This script processes input from standard input,
 * performs string manipulations, and calculates a specific value.
 */
var fileContent = require("fs") . readFileSync(
  "/dev/stdin" ,
  "utf8"
);

// Split the entire content into an array of lines.
fileContent = fileContent . split("\n");

let linePointer = 0; // Tracks the current line being read.

// Main processing loop, continues until a zero is encountered.
while (true)
{
  // Read the next number from the input stream.
  // The unary plus converts the string to a number.
  let itemQuantity = +fileContent[linePointer++];

  // If the quantity is zero, terminate the processing.
  if (itemQuantity === 0) {
    break;
  }

  // Initialize an array to store the original names.
  const nameCollection = [];

  // Populate the name collection with 'itemQuantity' entries.
  for (let k = 0; k < itemQuantity; k++)
  {
    nameCollection.push(fileContent[linePointer++]);
  }

  // Transform each name: keep the first character and then
  // any character immediately following a vowel.
  const processedItems = nameCollection.map((originalName) =>
  {
    let filteredPart = "";
    let isAfterVowel = true; // Flag to indicate if the next char should be added (initially true for the first char)

    // Iterate over each character in the original name.
    for (const currentLetter of originalName)
    {
      if (isAfterVowel) {
        filteredPart += currentLetter;
        isAfterVowel = false;
      }
      // Check if the current character is a vowel (case-insensitive implied by regex).
      if (/[aeiou]/.test(currentLetter)) {
        isAfterVowel = true;
      }
    }
    return filteredPart;
  })
  .sort(); // Sort the processed items alphabetically.

  // Helper function to determine the length of the common prefix
  // between two strings, up to a certain limit.
  const determineMatchExtent = (firstString, secondString) => {
    let commonLimit = Math.min(firstString.length, secondString.length);

    // This loop condition 'itemQuantity' is a characteristic of the original code,
    // potentially leading to out-of-bounds access if 'itemQuantity' is larger
    // than 'commonLimit'. This behavior is preserved.
    for (let charIndex = 0; charIndex < itemQuantity; charIndex++) {
      if (firstString[charIndex] !== secondString[charIndex]) {
        return charIndex; // Return the first index where characters differ.
      }
    }

    // If strings are identical up to their minimum length, and lengths are equal,
    // return -1 (indicating perfect match for compared portion).
    if (firstString.length === secondString.length) {
      return -1;
    }
    // Otherwise, return the minimum length (one string is a prefix of the other).
    return commonLimit;
  };

  let longestMatchLength = 0; // Variable to store the maximum common prefix found.

  // Loop through the sorted list of processed items to find the longest common prefix.
  for (let mainLoopIdx = 0; mainLoopIdx < itemQuantity; mainLoopIdx++)
  {
    // Skip the first element as there's no preceding element to compare with.
    if (mainLoopIdx === 0) continue;

    // Compare the current item with the previous one.
    const comparisonResult = determineMatchExtent(
      processedItems[mainLoopIdx - 1],
      processedItems[mainLoopIdx]
    );

    // If comparisonResult is -1, it implies an exact match (or identical prefixes
    // based on original code's `n` loop limit bug),
    // which signifies a specific condition to set a special value and break.
    if (comparisonResult === -1) {
      longestMatchLength = -2; // Special value indicating a specific scenario.
      break;
    }
    // Update the longestMatchLength if a longer common prefix is found.
    if (comparisonResult > longestMatchLength) {
      longestMatchLength = comparisonResult;
    }
  }

  // Output the final calculated value, incremented by one.
  console.log(longestMatchLength + 1);
}