function determineOptimalSubsequence(rawInputData) {
  // Validate raw input: ensure it's not null, undefined, or empty after trimming.
  if (!rawInputData || typeof rawInputData !== 'string' || rawInputData.trim().length === 0) {
    console.error("Input data is either missing or empty. Cannot proceed with subsequence computation.");
    return; // Exit if input is invalid
  }

  // Split the entire input string into individual lines.
  const sourceLines = rawInputData.split('\n');

  // Basic validation: ensure we have at least two lines for two sequences.
  if (sourceLines.length < 2) {
    console.error("Insufficient input provided. Expected at least two lines for two sequences.");
    return;
  }

  // Extract the first sequence and convert it into an array of characters.
  // Using direct indexing instead of shift() to avoid modifying the original array if it were reused.
  const primarySeqChars = Array.from(sourceLines[0]);
  // Extract the second sequence and convert it into an array of characters.
  const secondarySeqChars = Array.from(sourceLines[1]);

  // Store lengths in separate variables for better readability and potential performance (minor).
  const primarySeqLen = primarySeqChars.length;
  const secondarySeqLen = secondarySeqChars.length;

  // Initialize the dynamic programming matrix (memoization table) for LCS lengths.
  // The matrix dimensions are (primarySeqLen + 1) x (secondarySeqLen + 1).
  // All cells are initially filled with zero, representing the length of LCS for empty prefixes.
  let lcsMatrix = Array.from({ length: primarySeqLen + 1 }, () =>
    new Array(secondarySeqLen + 1).fill(0)
  );

  // Populate the DP matrix using a nested loop approach.
  // xCoord represents the current index in primarySeqChars (1-based).
  // yCoord represents the current index in secondarySeqChars (1-based).
  for (let xCoord = 1; xCoord <= primarySeqLen; ++xCoord) {
    for (let yCoord = 1; yCoord <= secondarySeqLen; ++yCoord) {
      // Get the characters at the current (0-based) positions.
      const charFromPrimary = primarySeqChars[xCoord - 1];
      const charFromSecondary = secondarySeqChars[yCoord - 1];

      // If the characters match, the LCS length increases by 1 from the diagonal element.
      if (charFromPrimary === charFromSecondary) {
        lcsMatrix[xCoord][yCoord] = lcsMatrix[xCoord - 1][yCoord - 1] + 1;
      } else {
        // If characters do not match, take the maximum LCS length from either
        // excluding the current character from the first sequence (cell above)
        // or excluding the current character from the second sequence (cell to the left).
        lcsMatrix[xCoord][yCoord] = (lcsMatrix[xCoord - 1][yCoord] > lcsMatrix[xCoord][yCoord - 1])
          ? lcsMatrix[xCoord - 1][yCoord]
          : lcsMatrix[xCoord][yCoord - 1];
      }
    }
  }

  // Reconstruct the actual Longest Common Subsequence by backtracking through the DP matrix.
  // Start from the bottom-right corner of the matrix.
  let currentX = primarySeqLen;
  let currentY = secondarySeqLen;
  let extractedSubsequence = []; // This array will store the LCS characters in reverse order.

  // Loop until we reach the top-left corner (either currentX or currentY becomes 0).
  while (currentX > 0 && currentY > 0) {
    const charA = primarySeqChars[currentX - 1];
    const charB = secondarySeqChars[currentY - 1];

    // If the characters at the current (0-based) positions are identical,
    // it means this character is part of the LCS.
    if (charA === charB) {
      extractedSubsequence.push(charA); // Add to our result.
      currentX--; // Move diagonally up-left.
      currentY--;
    } else {
      // If characters don't match, we need to determine which path (up or left)
      // led to the current maximum LCS length.
      // If the value from the cell directly above is greater than or equal to
      // the value from the cell directly to the left, move up.
      // This implicitly handles ties by prioritizing moving up (from primary sequence).
      if (lcsMatrix[currentX - 1][currentY] >= lcsMatrix[currentX][currentY - 1]) {
        currentX--; // Move up, effectively skipping charFromPrimary.
      } else {
        currentY--; // Move left, effectively skipping charFromSecondary.
      }
    }
  }

  // The subsequence was built in reverse order, so reverse it before joining.
  const finalLCSString = extractedSubsequence.reverse().join('');

  // Output the computed Longest Common Subsequence.
  console.log(finalLCSString);
}

// --- Execution Entry Point ---
try {
  // Read input from standard input, assuming UTF-8 encoding.
  // This is typical for competitive programming environments.
  const stdinContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  // Invoke the main function with the obtained input.
  determineOptimalSubsequence(stdinContent);
} catch (error) {
  // Catch and log any errors during file reading or execution.
  console.error("An error occurred during input processing or subsequence calculation:");
  console.error(error.message);
}