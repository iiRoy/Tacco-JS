'use strict'

function determineLCS(primarySeq, secondarySeq) {
  const primaryLen = primarySeq.length;
  const secondaryLen = secondarySeq.length;

  // Initialize a 2D array to store the lengths of LCS
  // `lcsLengths[i][j]` will store the length of LCS of primarySeq[0...i-1] and secondarySeq[0...j-1]
  const lcsLengths = Array.from({ length: primaryLen + 1 }, () =>
    Array.from({ length: secondaryLen + 1 }, () => 0)
  );

  // Fill the lcsLengths table using dynamic programming
  for (let pIdx = 1; pIdx <= primaryLen; pIdx++) {
    for (let sIdx = 1; sIdx <= secondaryLen; sIdx++) {
      if (primarySeq[pIdx - 1] === secondarySeq[sIdx - 1]) {
        // If characters match, extend the LCS from the diagonal element
        lcsLengths[pIdx][sIdx] = 1 + lcsLengths[pIdx - 1][sIdx - 1];
      } else {
        // If characters don't match, take the maximum LCS length from either
        // removing a character from primarySeq or secondarySeq
        lcsLengths[pIdx][sIdx] = Math.max(lcsLengths[pIdx - 1][sIdx], lcsLengths[pIdx][sIdx - 1]);
      }
    }
  }

  // Reconstruct the LCS string by backtracking through the lcsLengths table
  let currentP = primaryLen;
  let currentS = secondaryLen;
  const commonSubsequenceChars = []; // Use an array to build the string efficiently

  while (currentP > 0 && currentS > 0) {
    if (primarySeq[currentP - 1] === secondarySeq[currentS - 1]) {
      // If characters match, this character is part of the LCS.
      // Prepend it to the result and move diagonally up-left.
      commonSubsequenceChars.unshift(primarySeq[currentP - 1]);
      currentP--;
      currentS--;
    } else {
      // If characters don't match, move to the cell that contributed to the maximum length.
      // This means moving either up (primarySeq[currentP-1] was not part of LCS)
      // or left (secondarySeq[currentS-1] was not part of LCS).
      if (lcsLengths[currentP - 1][currentS] > lcsLengths[currentP][currentS - 1]) {
        currentP--; // Move up
      } else {
        currentS--; // Move left (or up if equal, either path is valid for reconstruction)
      }
    }
  }

  return commonSubsequenceChars.join('');
}

function processInput(inputData) {
  const dataLines = inputData.split("\n");
  const firstString = dataLines[0];
  const secondString = dataLines[1];
  const result = determineLCS(firstString, secondString);
  console.log(result);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
