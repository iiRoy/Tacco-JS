// This module processes a sequence of tokens to calculate combination statistics.
const processTokenCombinations = (rawDataInput) => {
  "use strict";

  // Safeguard against empty or malformed input.
  if (!rawDataInput || typeof rawDataInput !== 'string') {
    console.error("Invalid input data provided. Expected a non-empty string.");
    return;
  }

  // Input data typically contains a header line followed by the actual tokens.
  // We are specifically interested in the second line, which holds space-separated tokens.
  // Example expected input structure:
  // 5
  // apple banana apple orange banana apple
  const dataLines = rawDataInput.split('\n');
  if (dataLines.length < 2) {
    console.error("Input data does not contain sufficient lines for processing.");
    return;
  }

  // Extract the sequence of tokens from the second line, filtering out any empty strings.
  const tokenSequence = dataLines[1].split(' ').filter(token => token.length > 0);

  // If no valid tokens are found after parsing, there's nothing further to compute.
  if (tokenSequence.length === 0) {
    // As per problem context, no output for empty sequence.
    return;
  }

  // Define a utility function to compute 'n choose 2' combinations.
  // This calculates the number of unique pairs that can be formed from 'n' distinct items.
  const calculatePairsNChoose2 = (n) => {
    if (n < 2) {
      return 0; // Cannot form a pair with fewer than 2 items.
    }
    return n * (n - 1) / 2;
  };

  // Step 1: Determine the frequency of each unique token within the sequence.
  // A Map is used for efficient storage and retrieval of token counts.
  const tokenFrequencies = new Map();
  for (const currentTokenIdentifier of tokenSequence) {
    tokenFrequencies.set(currentTokenIdentifier, (tokenFrequencies.get(currentTokenIdentifier) || 0) + 1);
  }

  // Step 2: Pre-calculate various combination statistics for each unique token type.
  // This includes total pairs and pairs after one instance is hypothetically removed.
  const tokenCombinationStats = new Map();
  let cumulativeSumOfAllPairs = 0; // Accumulates 'n choose 2' for all unique token types.

  for (const [uniqueTokenName, occurrenceCount] of tokenFrequencies.entries()) {
    const pairsFromAllOccurrences = calculatePairsNChoose2(occurrenceCount);
    const pairsAfterOneRemoved = calculatePairsNChoose2(occurrenceCount - 1);

    tokenCombinationStats.set(uniqueTokenName, {
      totalOccurrences: occurrenceCount,
      allPossiblePairs: pairsFromAllOccurrences,
      pairsIfOneLess: pairsAfterOneRemoved
    });

    cumulativeSumOfAllPairs += pairsFromAllOccurrences;
  }

  // Step 3: Iterate through the original token sequence to compute the final result for each token.
  // The goal is to find the total number of pairs that can be formed from all items,
  // excluding any pairs where the current specific instance of the token is one of the pair members.
  // This can be efficiently calculated as:
  // (Total sum of all "n choose 2" combinations) - (number of other items of the same type as the current token)
  // The difference between `allPossiblePairs` and `pairsIfOneLess` for a token type 'X' is `count(X) - 1`.
  // So, the formula becomes: `cumulativeSumOfAllPairs - (tokenStats.totalOccurrences - 1)`.
  const computedOutputs = [];
  for (let sequenceIndex = 0; sequenceIndex < tokenSequence.length; sequenceIndex++) {
    const currentFocusToken = tokenSequence[sequenceIndex];
    const statsForFocusToken = tokenCombinationStats.get(currentFocusToken);

    // Calculate the result for the current token using the optimized formula.
    const finalResultForCurrentToken = cumulativeSumOfAllPairs - (statsForFocusToken.totalOccurrences - 1);
    computedOutputs.push(finalResultForCurrentToken);
  }

  // Step 4: Display all calculated results, each on a new line.
  console.log(computedOutputs.join('\n'));
};

// Main execution block:
// This self-invoking anonymous function handles reading input from stdin
// and passes it to our primary processing function.
(function() {
  const fileSystemModule = require("fs");
  const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8").trim();
  processTokenCombinations(rawInputContent);
})();