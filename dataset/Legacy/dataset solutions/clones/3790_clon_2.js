function ProcessInput(rawData) {
  // Split the raw input string into an array of lines
  let processedLines = rawData.split("\n");

  // Parse the first line as an integer, representing the length of the string
  const stringLength = parseInt(processedLines[0], 10);

  // The second line is the target string itself
  let targetString = processedLines[1];

  // Declare an array that is not used in the original logic, but must be preserved
  // for Type II cloning.
  const unusedArray = new Array(26);

  // Initialize arrays to store the first and last occurrence indices for each character
  // 'a' through 'z'.
  const firstOccurrences = new Array(26);
  const lastOccurrences = new Array(26);

  // Iterate through each character of the English alphabet (a-z)
  for (let charIndex = 0; charIndex < 26; charIndex++) {
    // Find the first occurrence of the current character (charIndex + 'a')
    // The loop variable 'firstOccurrences[charIndex]' is used directly as the index.
    for (firstOccurrences[charIndex] = 0; firstOccurrences[charIndex] < stringLength; firstOccurrences[charIndex]++) {
      // Check if the character at the current position matches the target character
      if (targetString.charCodeAt(firstOccurrences[charIndex]) === charIndex + 97) {
        break; // Found the first occurrence, exit this inner loop
      }
    }

    // Find the last occurrence of the current character (charIndex + 'a')
    // The loop variable 'lastOccurrences[charIndex]' is used directly as the index.
    // It starts from 'stringLength' and decrements.
    for (lastOccurrences[charIndex] = stringLength; lastOccurrences[charIndex] >= firstOccurrences[charIndex]; lastOccurrences[charIndex] += -1) {
      // Check if the character at the current position matches the target character
      if (targetString.charCodeAt(lastOccurrences[charIndex]) === charIndex + 97) {
        break; // Found the last occurrence, exit this inner loop
      }
    }
  }

  // Variable to hold the count of overlapping character ranges for a given position
  let overlapCount;
  // Variable to store the maximum overlap found across all positions
  let maximumOverlap = 0;

  // Iterate through each possible position within the string
  for (let currentPosition = 0; currentPosition < stringLength; currentPosition++) {
    overlapCount = 0; // Reset overlap count for the new position

    // Check how many character ranges include the current position
    for (let alphabetIterator = 0; alphabetIterator < 26; alphabetIterator++) {
      // A position 'currentPosition' is considered within a range if it's
      // greater than or equal to the first occurrence and strictly less than the last occurrence.
      // Note: The original code uses `j < r[k]`, implying an exclusive upper bound.
      if (currentPosition >= firstOccurrences[alphabetIterator] && currentPosition < lastOccurrences[alphabetIterator]) {
        overlapCount++; // Increment if the position falls within the range
      }
    }

    // Update the maximum overlap if the current position's overlap count is higher
    if (overlapCount > maximumOverlap) {
      maximumOverlap = overlapCount;
    }
  }

  // Output the final maximum overlap count to the console
  console.log('%d', maximumOverlap);
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
