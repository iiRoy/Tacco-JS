"use strict";

// This script processes input data to count occurrences of "AC" subsequences.
const processInput = (inputData) => {
  // Parse the first line to get the number of characters and queries.
  const firstLineParts = inputData.split("\n")[0].split(" ");
  const numChars = parseInt(firstLineParts[0]); // Total number of characters in the sequence.
  const numQueries = parseInt(firstLineParts[1]); // Number of queries to process.

  // Extract the character sequence from the second line.
  const charSequence = inputData.split("\n")[1].split("");

  // Extract query ranges from subsequent lines.
  // The slice starts from index 2 and goes up to numChars + 1 (inclusive of N lines for queries).
  // Note: The original code uses `N+1` for `lr` slice, which is incorrect if `N` is the length of `S`.
  // `lr` should contain `Q` lines, not `N` lines.
  // Let's re-evaluate the original `lr` line: `const lr = arg.split("\n").slice(2, N + 1);`
  // If `N` is the length of `S`, and `Q` is the number of queries, then `lr` should be `slice(2, 2 + Q)`.
  // The problem statement implies `N` is the length of `S` and `Q` is the number of queries.
  // The original code's `lr` slice is `slice(2, N + 1)`. This means it reads `N-1` query lines if `N` is the length of `S`.
  // This is a potential bug in the original code's interpretation of `N` for `lr` if `N` is string length.
  // However, the rule is "Preserve the same control flow, statement order, operators, expressions, algorithm, and behavior."
  // So, I must replicate `slice(2, N + 1)` even if it seems odd.
  const queryRanges = inputData.split("\n").slice(2, numChars + 1);

  // Initialize a prefix sum array to store counts of "AC" up to each index.
  let prefixCounts = new Array(numChars).fill(0);
  let currentCount = 0; // Accumulator for "AC" pairs.

  // Iterate through the character sequence to populate the prefix sum array.
  // The loop uses `for...in` over `dp` (which is `prefixCounts`), which iterates over indices as strings.
  for (let idxStr in prefixCounts) {
    const currentIdx = parseInt(idxStr); // Convert string index to integer.

    // Check for "AC" pair at the current position.
    // Note: `S[parseInt(i)+1]` means it checks `S[currentIdx]` and `S[currentIdx+1]`.
    if (charSequence[currentIdx] === "A" && charSequence[currentIdx + 1] === "C") {
      currentCount++; // Increment count if "AC" is found.
    }

    // Store the accumulated count in the prefix sum array.
    // The original code stores `cnt` at `dp[parseInt(i)+1]`.
    // This means `prefixCounts[1]` stores count up to index 0, `prefixCounts[2]` up to index 1, etc.
    // `prefixCounts[0]` remains 0.
    prefixCounts[currentIdx + 1] = currentCount;
  }

  // Process each query.
  for (let queryIdx = 0; queryIdx < numQueries; queryIdx++) {
    // Parse the left and right bounds for the current query.
    const rangeParts = queryRanges[queryIdx].split(" ");
    const leftBound = parseInt(rangeParts[0]);
    const rightBound = parseInt(rangeParts[1]);

    // Calculate the number of "AC" pairs within the specified range [leftBound, rightBound].
    // The prefix sum array `prefixCounts` is 1-indexed conceptually for the problem,
    // where `prefixCounts[k]` stores the count of "AC" up to index `k-1` in the original string.
    // So, `prefixCounts[rightBound - 1]` gives count up to `rightBound - 2`.
    // `prefixCounts[leftBound - 1]` gives count up to `leftBound - 2`.
    // The difference `prefixCounts[rightBound - 1] - prefixCounts[leftBound - 1]`
    // correctly calculates "AC" pairs in the range `[leftBound, rightBound-1]` (0-indexed).
    // This corresponds to `[leftBound+1, rightBound]` (1-indexed) in the problem's context.
    console.log(prefixCounts[rightBound - 1] - prefixCounts[leftBound - 1]);
  }
};

// Read input from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
