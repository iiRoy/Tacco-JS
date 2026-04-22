const analyzeSequences = (streamData) => {
  const dataSegments = streamData.split('\n');
  const sequenceA = dataSegments[0];
  const sequenceB = dataSegments[1];

  const memoizationTable = new Map(); // Stores results of subproblems to avoid redundant calculations

  // Recursive function to determine the longest common subsequence
  // It returns the LCS string directly, not just its length.
  const determineLongestCommonSubsequence = (indexA, indexB) => {
    // Construct a unique key for memoization based on current indices
    const cacheKey = `${indexA},${indexB}`;

    // If the result for these indices is already computed, return it from the cache
    if (memoizationTable.has(cacheKey)) {
      return memoizationTable.get(cacheKey);
    }

    // Base case: If either sequence is empty, the LCS is an empty string
    if (indexA === 0 || indexB === 0) {
      return "";
    }

    // If the last characters of the current subsequences match
    if (sequenceA[indexA - 1] === sequenceB[indexB - 1]) {
      // The matching character is part of the LCS. Prepend it to the LCS of the remaining subsequences.
      const subsequenceResult = determineLongestCommonSubsequence(indexA - 1, indexB - 1) + sequenceA[indexA - 1];
      memoizationTable.set(cacheKey, subsequenceResult); // Store the result
      return subsequenceResult;
    } else {
      // If the last characters do not match, consider two possibilities:
      // 1. Exclude the last character of sequenceA
      const candidate1 = determineLongestCommonSubsequence(indexA - 1, indexB);
      // 2. Exclude the last character of sequenceB
      const candidate2 = determineLongestCommonSubsequence(indexA, indexB - 1);

      // Choose the longer of the two candidate LCS strings
      const subsequenceResult = candidate1.length >= candidate2.length ? candidate1 : candidate2;
      memoizationTable.set(cacheKey, subsequenceResult); // Store the result
      return subsequenceResult;
    }
  };

  // Initiate the recursive process for the full sequences
  const finalLCS = determineLongestCommonSubsequence(sequenceA.length, sequenceB.length);

  // Output the result to standard output, followed by a newline
  process.stdout.write(finalLCS + '\n');
};

// Read the entire input from standard input
const inputSource = require('node:fs').readFileSync('/dev/stdin', 'utf8');

// Execute the sequence analysis
analyzeSequences(inputSource);