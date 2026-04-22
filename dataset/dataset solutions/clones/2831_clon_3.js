function calculateSubsequenceCount(rawInputString) {
  // A robust approach to parse multiline string input.
  // .trim() handles potential leading/trailing whitespace or empty lines.
  const inputLines = rawInputString.trim().split('\n');

  // Parse the lengths of the two sequences from the first line.
  // Using .map(Number) is a concise way to convert string parts to numbers.
  const dimensions = inputLines[0].split(' ').map(Number);
  const lenA = dimensions[0]; // Represents 'N' from original problem.
  const lenB = dimensions[1]; // Represents 'M' from original problem.

  // Parse the two sequences of integers from the subsequent lines.
  const seqA = inputLines[1].split(' ').map(Number); // 'S' from original.
  const seqB = inputLines[2].split(' ').map(Number); // 'T' from original.

  // Define the modulo value for all arithmetic operations to prevent overflow.
  // This is a common practice in problems involving large counts.
  const MODULUS_VALUE = 1000000007; // Equivalent to Math.pow(10, 9) + 7.

  // Helper function for modular addition.
  // Ensures results remain within the modular range [0, MODULUS_VALUE - 1].
  const performModularAdd = (val1, val2) => (val1 + val2) % MODULUS_VALUE;

  // Helper function for modular subtraction.
  // Handles negative intermediate results by adding the modulus.
  const performModularSubtract = (val1, val2) => (val1 - val2 + MODULUS_VALUE) % MODULUS_VALUE;

  // Initialize a 2D dynamic programming table.
  // memoDP[i][j] will store the number of common subsequences
  // considering the first 'i' elements of seqA and first 'j' elements of seqB.
  // The table size is (lenA + 1) x (lenB + 1) to accommodate empty prefixes.
  const memoDP = Array.from({ length: lenA + 1 }, () => Array(lenB + 1).fill(0));

  // Populate the DP table using nested loops.
  // Outer loop iterates through elements of seqA (from index 0 to lenA-1).
  for (let idxA = 0; idxA < lenA; ++idxA) {
    // Inner loop iterates through elements of seqB (from index 0 to lenB-1).
    for (let idxB = 0; idxB < lenB; ++idxB) {
      // Retrieve current elements for comparison.
      const currentElementA = seqA[idxA];
      const currentElementB = seqB[idxB];

      // Values from adjacent cells in the DP table are used for calculation.
      // These represent counts from subproblems.
      const countFromLeft = memoDP[idxA + 1][idxB];    // Subsequences using seqA[0...idxA] and seqB[0...idxB-1]
      const countFromAbove = memoDP[idxA][idxB + 1];   // Subsequences using seqA[0...idxA-1] and seqB[0...idxB]
      const countFromDiagonal = memoDP[idxA][idxB];    // Subsequences using seqA[0...idxA-1] and seqB[0...idxB-1]

      if (currentElementA === currentElementB) {
        // If the current elements match, we can form new common subsequences.
        // The total is derived by combining:
        // 1. Subsequences from (idxA+1, idxB)
        // 2. Subsequences from (idxA, idxB+1)
        // 3. Plus, new subsequences formed by appending the current matching element
        //    to all common subsequences found in (idxA, idxB), plus the single
        //    subsequence formed by the current element itself.
        // The formula simplifies to: (countFromLeft + countFromAbove + 1) % MODULUS_VALUE
        // This implicitly handles the inclusion-exclusion principle.
        const combinedCounts = performModularAdd(countFromLeft, countFromAbove);
        memoDP[idxA + 1][idxB + 1] = performModularAdd(combinedCounts, 1);
      } else {
        // If the current elements do not match, the number of common subsequences
        // is the sum of subsequences from (idxA+1, idxB) and (idxA, idxB+1),
        // minus the overlap (subsequences from (idxA, idxB)) to avoid double-counting.
        const sumOfAdjacent = performModularAdd(countFromLeft, countFromAbove);
        memoDP[idxA + 1][idxB + 1] = performModularSubtract(sumOfAdjacent, countFromDiagonal);
      }
    }
  }

  // The final answer typically asks for the total count of unique common subsequences,
  // including the empty subsequence. So, we add 1 to the result in the bottom-right cell.
  const totalUniqueSubsequences = performModularAdd(memoDP[lenA][lenB], 1);

  // Output the final computed result to standard output.
  process.stdout.write(totalUniqueSubsequences.toString() + '\n');

  // Return the result for potential external testing or chaining.
  return totalUniqueSubsequences;
}

// Entry point for execution in a Node.js environment, common for competitive programming.
// Reads input from standard input and passes it to the main calculation function.
calculateSubsequenceCount(require("fs").readFileSync("/dev/stdin", "utf8"));