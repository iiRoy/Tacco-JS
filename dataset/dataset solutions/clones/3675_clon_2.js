/* This script processes input from standard input to perform character sequence analysis. */

// Read all input from standard input (file descriptor 0), convert it to a string,
// and then split the string into an array of lines using the newline character as a delimiter.
const inputLines = (String(require("fs").readFileSync(0))).split('\n');

// The first line of input provides a numerical value representing the length of
// the string segments to be analyzed. This value is parsed as an integer.
// Simultaneously, an accumulator variable, 'totalOccurrences', is initialized to zero.
let segmentLength = parseInt(inputLines[totalOccurrences = 0]);

// The second line of input contains the complete character sequence that will be
// used for generating permutations in both processing passes.
const characterSequence = inputLines[1];

/*
 * First Pass: Generate and count permutations from the initial segment of the
 * 'characterSequence'. The generated permutations are stored as keys in the
 * 'inputLines' array (which acts as a hash map), with their counts as values.
 */
// This loop iterates through all possible bit patterns from (2^segmentLength - 1) down to 0.
// Each bit pattern determines the construction order of characters for a permutation.
for (let bitmaskCounter = (1 << segmentLength); bitmaskCounter--; ) {
  // Initialize the string key for the current permutation being generated.
  // The 'segmentLength' numerical value is explicitly coerced to a string,
  // forming the initial part of the permutation string.
  let currentPermutationKey = String(segmentLength);

  // This inner loop iterates from (segmentLength - 1) down to 0, processing
  // characters from the 'characterSequence' based on the 'bitmaskCounter'.
  for (let charIterator = segmentLength; charIterator--; ) {
    // Check if the 'charIterator'-th bit of 'bitmaskCounter' is set (i.e., 1).
    // If the bit is set, the character at 'characterSequence[charIterator]' is
    // prepended to 'currentPermutationKey'.
    // Otherwise, the character is appended to 'currentPermutationKey'.
    currentPermutationKey = (bitmaskCounter & (1 << charIterator))
      ? characterSequence[charIterator] + currentPermutationKey
      : currentPermutationKey + characterSequence[charIterator];
  }
  // After a permutation string is fully constructed, its count is incremented
  // in the 'inputLines' object. The bitwise OR 0 ensures that if the key
  // was previously undefined, it's treated as 0 before incrementing to 1.
  inputLines[currentPermutationKey] = (inputLines[currentPermutationKey] | 0) + 1;
}

/*
 * Second Pass: Generate permutations from a *different* segment of the
 * 'characterSequence' and sum up how many of these generated permutations
 * were found (and counted) in the first pass.
 */
// This loop also iterates through all possible bit patterns, identical to the first pass.
for (let patternIter = (1 << segmentLength); patternIter--; ) {
  // Re-initialize the string key for the current permutation for this pass.
  // Similar to the first pass, 'segmentLength' is coerced to a string.
  let currentPermutationKey = String(segmentLength);

  // This inner loop iterates from (segmentLength - 1) down to 0.
  for (let indexDecrementer = segmentLength; indexDecrementer--; ) {
    // For this pass, characters are taken from a different part of the
    // 'characterSequence'. The index is calculated as '2 * segmentLength - (indexDecrementer + 1)'.
    // The character is prepended or appended based on the 'indexDecrementer'-th bit of 'patternIter'.
    currentPermutationKey = (patternIter & (1 << indexDecrementer))
      ? characterSequence[2 * segmentLength + (~indexDecrementer)] + currentPermutationKey
      : currentPermutationKey + characterSequence[2 * segmentLength + (~indexDecrementer)];
  }
  // The count associated with the generated 'currentPermutationKey' from the first pass
  // is added to 'totalOccurrences'. If the key was not found in the first pass
  // (i.e., 'inputLines[currentPermutationKey]' is undefined), it defaults to 0.
  totalOccurrences += (inputLines[currentPermutationKey] || 0);
}

// Finally, the total accumulated count of matching permutations from the second
// pass that were also present in the first pass is printed to standard output.
console.log(totalOccurrences);