const FS_MODULE = require('fs');
const INPUT_FILE_PATH = '/dev/stdin';

const inputLines = FS_MODULE.readFileSync(INPUT_FILE_PATH, 'utf8').trim().split('\n');

const sourceString = inputLines[0];
const repeatCount = parseInt(inputLines[1]);

let finalRewriteCount;

// Helper function to calculate rewrites for a given block length
const calculateBlockRewrites = (blockLength) => {
  // This is mathematically equivalent to (blockLength - blockLength % 2) / 2
  return Math.floor(blockLength / 2);
};

// Structural edit: Use an if/else block to handle the single-character string case
// separately and earlier, as it overrides other calculations.
if (sourceString.length === 1) {
  // For a single character string repeated 'k' times, the total rewrites
  // are simply floor(k / 2).
  finalRewriteCount = calculateBlockRewrites(repeatCount);
} else {
  // Main logic for strings with length greater than 1
  // The regex /(.)\1*/g splits the string into blocks of consecutive identical characters.
  // Example: "AAABBC" -> ["AAA", "BB", "C"]
  // Note: If sourceString is empty, .match() returns null.
  // The subsequent .reduce() call on null will throw a TypeError,
  // which preserves the original code's behavior for empty input.
  const charBlocks = sourceString.match(/(.)\1*/g);

  // Calculate the initial number of rewrites within a single instance of the sourceString.
  // Preserving the .reduce() method to ensure exact error behavior if charBlocks is null.
  let initialRewritesPerString = charBlocks.reduce((accumulator, blockElement) => {
    return accumulator + calculateBlockRewrites(blockElement.length);
  }, 0);

  // Multiply by repeatCount to get the total rewrites without considering merges between repetitions.
  finalRewriteCount = initialRewritesPerString * repeatCount;

  // Check for additional rewrites due to merging blocks when the string is repeated.
  const firstBlock = charBlocks[0];
  const lastBlock = charBlocks[charBlocks.length - 1];

  // Preserve the exact original condition, including its specific behavior regarding
  // `[1].length`. If `firstBlock.length` or `lastBlock.length` is 1, accessing `[1]`
  // results in `undefined`, and then `.length` on `undefined` will throw a TypeError.
  // This behavior is critical to preserve for strict equivalence.
  if (firstBlock[0][0] === lastBlock[0][0] && firstBlock[1].length % 2 === 1 && lastBlock[1].length % 2 === 1) {
    // If the first and last characters match, and both the first and last blocks
    // (as interpreted by the original code's potentially buggy `[1].length` check)
    // would contribute to a merge, then k-1 additional rewrites occur.
    finalRewriteCount += repeatCount - 1;
  }
}

console.log(finalRewriteCount);
