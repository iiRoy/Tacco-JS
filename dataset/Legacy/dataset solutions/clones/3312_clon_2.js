function processInput(rawData) {
  // Split the raw input string into individual lines.
  const inputLines = rawData.split('\n');

  // Extract the first sequence of characters from the first line.
  const firstSequence = inputLines.shift().split('');
  // Extract the second sequence of characters from the second line.
  const secondSequence = inputLines.shift().split('');

  // Initialize a 2D array (dynamic programming table) for LCS calculation.
  // The table dimensions are (length of first sequence + 1) by (length of second sequence + 1).
  let lcsTable = [];
  for (let rowIdx = 0; rowIdx <= firstSequence.length; rowIdx++) {
    lcsTable.push(Array(secondSequence.length + 1).fill(0)); // Fill each row with zeros initially.
  }

  // Populate the LCS table using dynamic programming.
  // Iterate through each character of the first sequence.
  for (let rowIdx = 1; rowIdx <= firstSequence.length; rowIdx++) {
    // Iterate through each character of the second sequence.
    for (let colIdx = 1; colIdx <= secondSequence.length; colIdx++) {
      // If the current characters from both sequences match,
      // increment the value from the diagonal cell (top-left).
      if (firstSequence[rowIdx - 1] === secondSequence[colIdx - 1]) {
        lcsTable[rowIdx][colIdx] = Math.max(lcsTable[rowIdx][colIdx], lcsTable[rowIdx - 1][colIdx - 1] + 1);
      } else {
        // If characters do not match, take the maximum value from
        // the cell directly above or the cell directly to the left.
        lcsTable[rowIdx][colIdx] = Math.max(lcsTable[rowIdx - 1][colIdx], lcsTable[rowIdx][colIdx - 1]);
      }
    }
  }

  // Backtrack through the populated LCS table to reconstruct the longest common subsequence.
  let currentFirstIdx = firstSequence.length;
  let currentSecondIdx = secondSequence.length;
  const commonSubsequenceChars = []; // This array will store the characters of the LCS.

  // Continue backtracking as long as both indices are greater than zero.
  while (currentFirstIdx !== 0 && currentSecondIdx !== 0) {
    // If the characters at the current indices in the original sequences match,
    // it means this character is part of the LCS.
    if (firstSequence[currentFirstIdx - 1] === secondSequence[currentSecondIdx - 1]) {
      commonSubsequenceChars.unshift(firstSequence[currentFirstIdx - 1]); // Add character to the front of the array.
      currentFirstIdx--; // Move diagonally up-left in the DP table.
      currentSecondIdx--;
    } else {
      // If characters do not match, move to the cell (either up or left)
      // that has the larger value, indicating the path of the LCS.
      if (lcsTable[currentFirstIdx - 1][currentSecondIdx] < lcsTable[currentFirstIdx][currentSecondIdx - 1]) {
        currentSecondIdx--; // Move left.
      } else {
        currentFirstIdx--; // Move up.
      }
    }
  }

  // Join the characters in the commonSubsequenceChars array to form the final string
  // and print it to the console.
  console.log(commonSubsequenceChars.join(''));
}

// Read input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
