const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// The primary string for processing
const inputString = inputLines[0];

// The integer repeat count
const repeatCount = parseInt(inputLines[1], 10);

/*
  Splits the input string into blocks of consecutive identical characters.
  For example, "AAABBC" becomes ["AAA", "BB", "C"].
*/
const charBlocks = inputString.match(/(.)\1*/g);

// Calculate the initial number of rewrites needed for a single instance of the string
let initialRewrites = charBlocks.reduce((accumulator, currentBlock, blockIndex) => {
  // For each block, calculate how many pairs of characters can be removed.
  // e.g., "AAA" -> 1 rewrite (AA -> A), "BBBB" -> 2 rewrites (BB -> B, BB -> B)
  return accumulator + Math.floor(currentBlock.length / 2);
}, 0);

// Initialize the total count based on the initial rewrites and repeat count
let finalCount = initialRewrites * repeatCount;

// Check for a special case where the first and last blocks can merge across repetitions
const firstBlock = charBlocks[0];
const lastBlock = charBlocks[charBlocks.length - 1];

// If the first character of the first block is the same as the first character of the last block,
// and both blocks have an odd length (meaning they each have a single character left after pairing),
// then they can merge across the boundary of repeated strings.
if (firstBlock[0] === lastBlock[0] && firstBlock.length % 2 === 1 && lastBlock.length % 2 === 1) {
  // This merge creates an additional rewrite opportunity for each boundary between repetitions.
  // For 'k' repetitions, there are 'k-1' such boundaries.
  finalCount += (repeatCount - 1);
}

// Handle the edge case where the input string has only one character.
// In this scenario, the block merging logic above might not apply correctly,
// or the initial calculation needs adjustment.
if (inputString.length === 1) {
  // If 'k' is even, all characters can be paired up (k/2 rewrites).
  // If 'k' is odd, one character remains (floor(k/2) rewrites).
  // This can be simplified to (k - k % 2) / 2 or Math.floor(k / 2).
  finalCount = Math.floor(repeatCount / 2);
}

// Output the final calculated number of rewrites.
console.log(finalCount);
