const executeSequenceGeneration = (rawDataContent) => {
  // Validate input presence and type
  if (!rawDataContent || typeof rawDataContent !== 'string' || rawDataContent.trim() === '') {
    console.error("Error: Input data is missing or invalid. Please provide a string representing the target sequence length.");
    return; // Exit if input is invalid
  }

  // Parse the raw input string into an integer, removing any leading/trailing whitespace
  const sequenceLengthLimit = parseInt(rawDataContent.trim(), 10);

  // Add a guard clause for non-positive or non-numeric length
  if (isNaN(sequenceLengthLimit) || sequenceLengthLimit <= 0) {
    console.warn(`Warning: The provided sequence length limit ('${rawDataContent.trim()}') is not a positive integer. Cannot proceed with calculation.`);
    return; // Exit if the parsed length is invalid
  }

  // Initiate the recursive permutation counting process and display the final result
  const finalValidPermutationCount = determinePermutationCount(sequenceLengthLimit, "", 0);
  console.info(`The total number of valid sequences of length ${sequenceLengthLimit} is: ${finalValidPermutationCount}`);
};

// A cache to store previously computed results, preventing redundant calculations (memoization)
// Keys are formed by combining the last four characters of a sequence and its current length.
const memoizationCache = {};

// The set of allowed characters (nucleotide bases for DNA/RNA sequences)
const allowedCharacters = ['A', 'C', 'G', 'T'];

// A constant for the modulo operation, used to keep numbers within a manageable range
const MODULO_CONSTANT = 1000000007;

// The specific forbidden three-character pattern
const FORBIDDEN_PATTERN_ROOT = 'AGC';

/**
 * Checks if a given suffix, after appending a new character, forms any forbidden arrangements.
 * This function encapsulates the complex validity rules from the original problem.
 *
 * @param {string} currentSuffixFragment - The last few characters of the sequence built so far (max 4 chars).
 * @param {string} appendedChar - The new character being added to the sequence.
 * @returns {boolean} True if the combined suffix contains a forbidden pattern, false otherwise.
 */
const containsProblematicArrangement = (currentSuffixFragment, appendedChar) => {
  // Construct the full potential suffix by appending the new character
  const compositeSuffixCandidate = currentSuffixFragment + appendedChar;
  const candidateLength = compositeSuffixCandidate.length;

  // Rule Set 1: Check for specific 3-character permutations in the last three positions
  if (candidateLength >= 3) {
    const lastThreeChars = compositeSuffixCandidate.slice(-3); // Get the last three characters
    if (
      lastThreeChars === FORBIDDEN_PATTERN_ROOT || // Direct 'AGC' pattern
      (lastThreeChars[0] === 'A' && lastThreeChars[2] === 'G' && lastThreeChars[1] === 'C') || // Permutation 'ACG'
      (lastThreeChars[1] === 'A' && lastThreeChars[0] === 'G' && lastThreeChars[2] === 'C')    // Permutation 'GAC'
    ) {
      return true; // A problematic 3-char arrangement was found
    }
  }

  // Rule Set 2: Check for specific 4-character patterns that could lead to 'AGC'
  if (candidateLength >= 4) {
    const lastFourChars = compositeSuffixCandidate.slice(-4); // Get the last four characters
    if (
      (lastFourChars[0] === 'A' && lastFourChars[1] === 'G' && lastFourChars[3] === 'C') || // Pattern 'AG_C' (where _ is lastFourChars[2])
      (lastFourChars[0] === 'A' && lastFourChars[2] === 'G' && lastFourChars[3] === 'C')    // Pattern 'A_GC' (where _ is lastFourChars[1])
    ) {
      return true; // A problematic 4-char arrangement was found
    }
  }

  return false; // No problematic arrangement detected
};


/**
 * Recursively calculates the number of valid sequences of a target length.
 * Uses dynamic programming with memoization to optimize performance.
 *
 * @param {number} targetLength - The desired final length of the sequence.
 * @param {string} suffixKey - The last up to four characters of the current sequence being built.
 * @param {number} processedCount - The current length of the sequence being built.
 * @returns {number} The count of valid sequences that can be formed from this state.
 */
function determinePermutationCount(targetLength, suffixKey, processedCount) {
  // Construct a unique identifier for the current state to use as a cache key
  const lookupIdentifier = `${suffixKey}_${processedCount}`;

  // Check if the result for this state has already been computed and stored in the cache
  if (memoizationCache[lookupIdentifier] !== undefined) {
    return memoizationCache[lookupIdentifier];
  }

  // Base case: If the current sequence has reached the target length, it's a valid completion
  if (processedCount === targetLength) {
    return 1; // One valid sequence found from this path
  }

  // Initialize a variable to accumulate the total count of valid combinations from this state
  let totalValidCombinations = 0;

  // Iterate through each allowed character to append it to the current sequence
  for (let charIndex = 0; charIndex < allowedCharacters.length; charIndex++) {
    const nextPermissibleCharacter = allowedCharacters[charIndex];

    // Use the helper function to determine if appending this character creates a forbidden pattern
    if (!containsProblematicArrangement(suffixKey, nextPermissibleCharacter)) {
      // If the pattern is not forbidden, recursively call the function for the next state
      // The new suffix key is the last four characters of the extended sequence
      const newSuffixForNextCall = (suffixKey + nextPermissibleCharacter).slice(-4);
      const combinationsFromNextStep = determinePermutationCount(targetLength, newSuffixForNextCall, processedCount + 1);

      // Add the results from the recursive call and apply modulo to prevent overflow
      totalValidCombinations = (totalValidCombinations + combinationsFromNextStep) % MODULO_CONSTANT;
    }
  }

  // Store the computed result in the cache before returning, for future lookups
  memoizationCache[lookupIdentifier] = totalValidCombinations;
  return totalValidCombinations;
}

// Main execution block: Handles reading input from stdin and initiating the process.
try {
  // Read the entire content of stdin as a UTF-8 string
  const inputDataFromFile = require('fs').readFileSync('/dev/stdin', 'UTF-8');
  // Pass the raw file content to the main function for processing
  executeSequenceGeneration(inputDataFromFile);
} catch (fileReadError) {
  // Catch and report any errors that occur during file reading
  console.error("Failed to read input from /dev/stdin. Please ensure the input file exists and is accessible.");
  console.error("Error details:", fileReadError.message);
  // Optionally, provide a fallback or exit the process gracefully here if needed.
}