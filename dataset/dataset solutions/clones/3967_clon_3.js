'use strict';

/**
 * Analyzes a given input string to determine the highest net score among various
 * item identifiers. The process involves incrementing scores for 'primary' items
 * and decrementing scores for 'deduction' items.
 *
 * @param {string} rawInputContent - The complete input provided as a single string.
 *   This string is expected to be multi-line, structured as follows:
 *   - The first line contains an integer 'P', representing the count of primary identifiers.
 *   - The next 'P' lines are the primary identifiers themselves.
 *   - A single line following the primary identifiers is ignored (often a blank separator).
 *   - The subsequent lines, up to the second-to-last line, are deduction identifiers.
 *   - The very last line of the input is typically ignored.
 */
function processItemScoring(rawInputContent) {

  // Divide the raw input content into an array of individual lines for processing.
  const contentLines = rawInputContent.split('\n');

  // Implement basic input validation to ensure minimum expected lines are present.
  // At a minimum, we need P, at least one primary item (if P>0), a separator,
  // and at least one deduction item.
  // If P=0, we need P, separator, deduction[0]. So 3 lines.
  if (contentLines.length < 3) {
    console.error("Error: Input content is too sparse. Expected at least 3 lines for processing.");
    return; // Terminate execution if input is malformed.
  }

  // Parse the number of primary items from the very first line of the input.
  // Using parseInt with radix 10 for explicit base conversion.
  const primaryItemCount = parseInt(contentLines[0], 10);

  // Validate that the parsed count is a valid, non-negative integer.
  if (isNaN(primaryItemCount) || primaryItemCount < 0) {
    console.error("Error: The first line must contain a non-negative integer indicating the primary item count.");
    return; // Terminate if the count is invalid.
  }

  // Extract the subset of lines corresponding to the primary items.
  // These lines are from index 1 up to (but not including) 1 + primaryItemCount.
  const positiveContributionItems = contentLines.slice(1, 1 + primaryItemCount);

  // Extract the subset of lines corresponding to the deduction items.
  // These lines start after the primary items and the separator line,
  // and go up to (but not including) the very last line of the input.
  const negativeContributionItems = contentLines.slice(primaryItemCount + 2, contentLines.length - 1);

  // Initialize a Map to store the running net score for each unique item identifier.
  // Maps offer efficient key-value storage and retrieval, suitable for counting.
  const itemNetScores = new Map(); // Key: item identifier (string), Value: net score (number)

  // --- Phase 1: Process positive contributions ---
  // Iterate through all primary items and increment their respective scores.
  positiveContributionItems.forEach(currentIdentifier => {
    // Retrieve the current score for the identifier, defaulting to 0 if it's new.
    const existingScore = itemNetScores.get(currentIdentifier) || 0;
    // Update the score by adding 1.
    itemNetScores.set(currentIdentifier, existingScore + 1);
  });

  // --- Phase 2: Process negative contributions ---
  // Iterate through all deduction items and decrement their respective scores.
  negativeContributionItems.forEach(currentIdentifier => {
    // Retrieve the current score, defaulting to 0 if the item wasn't seen as primary.
    const existingScore = itemNetScores.get(currentIdentifier) || 0;
    // Update the score by subtracting 1.
    itemNetScores.set(currentIdentifier, existingScore - 1);
  });

  // Transform the Map of item scores into an array of objects.
  // Each object will clearly separate the 'name' of the item from its 'finalScore'.
  const scoredItemRecords = Array.from(itemNetScores.entries()).map(([itemName, finalScore]) => ({
    name: itemName,
    score: finalScore
  }));

  // Sort the array of scored item records.
  // The sorting is done in descending order based on the 'score' property,
  // bringing items with higher net scores to the beginning of the array.
  scoredItemRecords.sort((recordA, recordB) => recordB.score - recordA.score);

  // Determine the final maximum net score.
  let ultimateResult;

  // If no items were processed (e.g., both primary and deduction lists were empty),
  // the maximum score is considered to be 0.
  if (scoredItemRecords.length === 0) {
    ultimateResult = 0;
  } else {
    // Otherwise, retrieve the score of the top-ranked item.
    const highestAchievedScore = scoredItemRecords[0].score;
    // Ensure the final result is not negative; if the highest score is negative,
    // it should be reported as 0.
    ultimateResult = Math.max(0, highestAchievedScore);
  }

  // Output the computed ultimate result to the standard console.
  console.log(ultimateResult);
}

// The main execution block: reads input from standard input and invokes the processing function.
// This setup is typical for competitive programming environments using Node.js.
processItemScoring(require("fs").readFileSync("/dev/stdin", "utf8"));