function processInputData(rawData) {
  // Split the entire input string into individual text rows
  const textRows = rawData.split('\n');

  // Extract the first sequence of characters from the first row
  const firstSequence = textRows.shift().split('');

  // Extract the second sequence of characters from the second row
  const secondSequence = textRows.shift().split('');

  // Initialize a 2D array (matrix) for dynamic programming calculations.
  // This matrix will store the lengths of common subsequences.
  const lcsMatrix = [];
  for (let rowIter = 0; rowIter <= firstSequence.length; rowIter++) {
    // For each row, create a new array filled with zeros,
    // matching the length of the second sequence plus one.
    lcsMatrix.push(Array(secondSequence.length + 1).fill(0));
  }

  // Populate the LCS matrix using a nested loop approach.
  // The outer loop iterates through the first sequence, and the inner through the second.
  for (let rowIter = 1; rowIter <= firstSequence.length; rowIter++) {
    for (let colIter = 1; colIter <= secondSequence.length; colIter++) {
      // Check if the current characters from both sequences match.
      if (firstSequence[rowIter - 1] === secondSequence[colIter - 1]) {
        // If they match, the length of the common subsequence increases by one
        // from the diagonal element (previous match).
        lcsMatrix[rowIter][colIter] = Math.max(lcsMatrix[rowIter][colIter], lcsMatrix[rowIter - 1][colIter - 1] + 1);
      } else {
        // If characters do not match, take the maximum value from
        // the cell above (excluding current char from first sequence)
        // or the cell to the left (excluding current char from second sequence).
        lcsMatrix[rowIter][colIter] = Math.max(lcsMatrix[rowIter - 1][colIter], lcsMatrix[rowIter][colIter - 1]);
      }
    }
  }

  // Backtrack through the filled LCS matrix to reconstruct the actual common subsequence.
  let rowBack = firstSequence.length;
  let colBack = secondSequence.length;
  const commonChars = []; // Array to store the characters of the LCS.

  // Loop continues as long as there are elements to compare in both sequences.
  while (rowBack !== 0 && colBack !== 0) {
    // If the characters at the current indices of the original sequences match,
    // it means this character is part of the common subsequence.
    if (firstSequence[rowBack - 1] === secondSequence[colBack - 1]) {
      // Add the matched character to the beginning of our result array.
      commonChars.unshift(firstSequence[rowBack - 1]);
      rowBack--; // Move diagonally up-left in the matrix.
      colBack--;
    } else {
      // If characters don't match, move to the cell that contributed the larger value
      // (either from above or from the left) to find the path of the LCS.
      if (lcsMatrix[rowBack - 1][colBack] < lcsMatrix[rowBack][colBack - 1]) {
        colBack--; // Move left
      } else {
        rowBack--; // Move up
      }
    }
  }

  // Output the reconstructed longest common subsequence as a single string.
  console.log(commonChars.join(''));
}

// Read input from standard input and pass it to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));