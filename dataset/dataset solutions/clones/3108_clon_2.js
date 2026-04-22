// This module computes the number of valid DNA-like sequences.

// A cache to store results of subproblems for memoization.
// The key is formed by the last four characters appended with an underscore and the current sequence length.
let resultStore = {};

// The set of available nucleotide bases.
const availableChars = ['A', 'C', 'G', 'T'];

/**
 * Initiates the sequence generation process.
 * @param {string} rawInput The raw input string, expected to be a number.
 */
const initiateSequence = (rawInput) => {
  // Convert the input string to a numerical target length.
  const targetLength = Number(rawInput);

  // Output the total number of valid sequences.
  console.log(countValidPermutations(targetLength, "", 0));
};


/**
 * Recursively counts the number of valid sequences of a given length,
 * avoiding specific 'AGC' patterns.
 *
 * @param {number} desiredLength The total length the sequence must reach.
 * @param {string} suffixString The last few characters of the current sequence.
 * @param {number} currentLength The current length of the sequence being built.
 * @returns {number} The count of valid sequences that can be formed from this state.
 */
function countValidPermutations(desiredLength, suffixString, currentLength) {
  // Construct a unique key for memoization.
  const memoKey = suffixString + "_" + currentLength;

  // If this subproblem has already been computed, return the cached result.
  if (resultStore[memoKey]) {
    return resultStore[memoKey];
  }

  // Base case: If the desired length is reached, this path is valid.
  if (currentLength === desiredLength) {
    return 1;
  }

  let totalCount = 0;
  const MODULO_VALUE = 1000000007;

  // Iterate through each possible next character.
  for (let charIndex = 0; charIndex < 4; charIndex++) {
    const extendedString = suffixString + availableChars[charIndex];

    // Extract the last three and four characters for pattern checking.
    const threeCharSuffix = extendedString.slice(-3);
    const fourCharSuffix = extendedString.slice(-4);

    // Check for 'AGC' pattern violations in various permutations.
    // The disallowed patterns are 'AGC' itself, and permutations involving 'A', 'G', 'C'
    // where they appear within the last 3 or 4 characters in a problematic order.
    // Specifically:
    // 1. 'AGC' directly (e.g., in 'XAGC')
    // 2. 'ACG' (A G C swapped)
    // 3. 'GAC' (G A C swapped)
    // 4. 'AGXC' (A G X C where X is any character)
    // 5. 'AXGC' (A X G C where X is any character)
    if (
      threeCharSuffix[0] + threeCharSuffix[1] + threeCharSuffix[2] !== 'AGC' &&
      threeCharSuffix[0] + threeCharSuffix[2] + threeCharSuffix[1] !== 'AGC' &&
      threeCharSuffix[1] + threeCharSuffix[0] + threeCharSuffix[2] !== 'AGC' &&

      fourCharSuffix[0] + fourCharSuffix[1] + fourCharSuffix[3] !== 'AGC' &&
      fourCharSuffix[0] + fourCharSuffix[2] + fourCharSuffix[3] !== 'AGC'
    ) {
      // If no forbidden pattern is found, recursively call for the next step.
      // We only pass the last four characters to limit the state space.
      totalCount += countValidPermutations(desiredLength, extendedString.slice(-4), currentLength + 1);
      totalCount %= MODULO_VALUE; // Apply modulo to prevent overflow.
    }
  }

  // Store the computed result in the cache before returning.
  resultStore[memoKey] = totalCount;
  return totalCount;
}

// Main execution block: read input from stdin and start the process.
initiateSequence(require('fs').readFileSync('/dev/stdin', 'UTF-8'));