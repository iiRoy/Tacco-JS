const executeProgram = (programInput) => {
  // Parse the input string into a numerical target length.
  const targetLength = Number(programInput);

  // Initiate the recursive calculation with an empty string for the last four characters
  // and a starting count of zero, then print the final result.
  console.log(computeValidSequences(targetLength, "", 0));
};

// A cache object to store results of subproblems for memoization.
// The key is formed by the last four characters concatenated with the current length.
let memoizationCache = {};

// An array containing the allowed nucleotide characters.
const nucleotideChars = ['A', 'C', 'G', 'T'];

/**
 * Recursively computes the number of valid DNA sequences of a given length,
 * avoiding specific "AGC" patterns.
 *
 * @param {number} targetLen The desired total length of the sequence.
 * @param {string} lastFourChars The last four characters of the sequence built so far.
 * @param {number} currentLength The current length of the sequence being built.
 * @returns {number} The count of valid sequences.
 */
function computeValidSequences(targetLen, lastFourChars, currentLength) {
  // Construct a unique key for memoization.
  const cacheKey = lastFourChars + "_" + currentLength;

  // If the result for this state is already in the cache, return it.
  if (memoizationCache[cacheKey]) {
    return memoizationCache[cacheKey];
  }

  // Base case: If the current length matches the target length,
  // we've successfully formed one valid sequence.
  if (currentLength === targetLen) {
    return 1;
  }

  let resultCount = 0; // Initialize the count of valid sequences from this state.

  // Iterate through each possible nucleotide character to append.
  for (let charIndex = 0; charIndex < 4; charIndex++) {
    // Form the proposed new sequence by appending the current character.
    const proposedSequence = lastFourChars + nucleotideChars[charIndex];

    // Extract the last three characters of the proposed sequence.
    const lastThree = (proposedSequence).slice(-3);
    // Extract the last four characters of the proposed sequence.
    const lastFour = (proposedSequence).slice(-4);

    // Check for invalid "AGC" patterns.
    // The conditions ensure that no permutation of 'A', 'G', 'C' appears in specific positions
    // within the last three or four characters.
    if (
      lastThree[0] + lastThree[1] + lastThree[2] !== 'AGC' &&
      lastThree[0] + lastThree[2] + lastThree[1] !== 'AGC' &&
      lastThree[1] + lastThree[0] + lastThree[2] !== 'AGC' &&
      lastFour[0] + lastFour[1] + lastFour[3] !== 'AGC' &&
      lastFour[0] + lastFour[2] + lastFour[3] !== 'AGC'
    ) {
      // If no invalid pattern is found, recursively call the function
      // for the next state (updated last four characters and incremented length).
      resultCount += computeValidSequences(targetLen, proposedSequence.slice(-4), currentLength + 1);
      // Apply modulo operation to prevent integer overflow, as results can be very large.
      resultCount %= 1000000007;
    }
  }

  // Store the computed result in the cache before returning.
  memoizationCache[cacheKey] = resultCount;
  return resultCount;
}

// Read input from standard input, decode it as UTF-8, and pass it to the main function.
executeProgram(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
