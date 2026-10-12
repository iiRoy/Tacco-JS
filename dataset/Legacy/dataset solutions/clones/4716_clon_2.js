'use strict';

// Utility function for logging messages to the console
const outputMessage = (messageContent) => {
  console.log(messageContent);
};

// Read input data from standard input, decode as UTF-8,
// remove leading/trailing whitespace, and split into lines.
const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split('\n');

// Parse the dimensions of the main grid and the search pattern.
// The first line contains N and M.
const gridSizeN = Number(rawInputData[0].split(' ')[0]);
const patternSizeM = Number(rawInputData[0].split(' ')[1]);

// Extract the main grid (A) from the input lines.
// It spans from the second line up to (1 + N) lines.
const mainGrid = rawInputData.slice(1, 1 + gridSizeN).map(lineContent => lineContent.split(''));

// Extract the search pattern (B) from the input lines.
// It spans from (1 + N) up to (1 + N + M) lines.
const searchPattern = rawInputData.slice(1 + gridSizeN, 1 + gridSizeN + patternSizeM).map(lineContent => lineContent.split(''));

// Iterate through all possible top-left positions (rowIdxMain, colIdxMain)
// in the main grid where the pattern could potentially start.
for (let rowIdxMain = 0; rowIdxMain <= gridSizeN - patternSizeM; rowIdxMain++) {
  for (let colIdxMain = 0; colIdxMain <= gridSizeN - patternSizeM; colIdxMain++) {

    // Check if the very first character of the pattern matches
    // the current character in the main grid. This is an optimization.
    if (mainGrid[rowIdxMain][colIdxMain] === searchPattern[0][0]) {
      let matchFound = true; // Assume a match until proven otherwise

      // If the first character matches, proceed to check the entire pattern.
      // Iterate through each cell of the search pattern.
      for (let rowIdxPattern = 0; rowIdxPattern < patternSizeM; rowIdxPattern++) {
        for (let colIdxPattern = 0; colIdxPattern < patternSizeM; colIdxPattern++) {

          // Compare the character in the main grid at the corresponding position
          // with the character in the search pattern.
          if (mainGrid[rowIdxMain + rowIdxPattern][colIdxMain + colIdxPattern] === searchPattern[rowIdxPattern][colIdxPattern]) {
            // Characters match, continue to the next character in the pattern.
            continue;
          } else {
            // A mismatch found, so this starting position is not a match.
            matchFound = false;
            break; // Exit the inner loop (colIdxPattern)
          }
        }
        if (!matchFound) {
          break; // If a mismatch was found, exit the outer loop (rowIdxPattern) as well.
        }
      }

      // After checking all characters of the pattern for the current starting position:
      if (matchFound) {
        // If 'matchFound' is still true, the entire pattern was found.
        outputMessage('Yes'); // Print "Yes"
        process.exit();      // Terminate the program immediately.
      }
    }
  }
}

// If the program reaches this point, it means no pattern was found
// after checking all possible starting positions.
outputMessage('No'); // Print "No"
