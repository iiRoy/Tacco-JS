/*
 * This JavaScript module processes a multi-line string input to calculate
 * a net score for various string tokens. It identifies two distinct groups
 * of items based on initial counts: "primary" items which contribute positively
 * to a score, and "secondary" items which contribute negatively.
 * The ultimate goal is to determine the highest possible net score achieved
 * by any single token, ensuring the final output is never below zero.
 *
 * This implementation incorporates robust input validation, utilizes modern
 * JavaScript features like Map for efficient key-value tracking, and
 * employs distinct naming conventions for clarity and to demonstrate
 * a Type III code clone transformation.
 */
function processInputData(rawTextContent) {
  // Defensive check for input validity: Ensure it's a non-empty string.
  if (typeof rawTextContent !== 'string' || rawTextContent.trim().length === 0) {
    console.error("Input processing aborted: Provided content is empty or not a valid string.");
    return; // Terminate execution if input is invalid.
  }

  // Divide the complete text content into an array of individual lines.
  // The regex /\r?\n/ handles both Windows (CRLF) and Unix (LF) style newlines.
  const contentLines = rawTextContent.split(/\r?\n/);

  // A preliminary check to ensure there are enough lines to parse the initial counts.
  const minimumExpectedLines = 2; // At least N and M need to be present.
  if (contentLines.length < minimumExpectedLines) {
    console.error("Input processing aborted: Insufficient lines to extract configuration parameters.");
    return;
  }

  // Extract the count for "primary" items (analogous to N in the original).
  const primaryItemCountStr = contentLines[0];
  const numPrimaryItems = Number.parseInt(primaryItemCountStr, 10);

  // Validate the parsed primary item count.
  if (Number.isNaN(numPrimaryItems) || numPrimaryItems < 0) {
    console.error(`Input processing aborted: Invalid primary item count "${primaryItemCountStr}". Expecting a non-negative integer.`);
    return;
  }

  // Initialize data structures for holding parsed items and their scores.
  const positiveContributionList = [];
  const negativeContributionList = [];
  // Using a Map for occurrence tracking offers better performance for string keys
  // and avoids potential issues with object prototype properties compared to plain objects.
  const scoreAccumulator = new Map();

  // Populate the list of positive-contributing items.
  // These items start from the second line (index 1) up to `numPrimaryItems` lines.
  for (let currentLineIdx = 0; currentLineIdx < numPrimaryItems; ++currentLineIdx) {
    const sourceLineNumber = currentLineIdx + 1; // Adjust for 0-based array indexing vs 1-based line numbers.
    if (sourceLineNumber < contentLines.length) {
      positiveContributionList.push(contentLines[sourceLineNumber]);
    } else {
      console.warn(`Warning: Input ended prematurely. Expected primary item at line ${sourceLineNumber}, but it's missing.`);
      break; // Stop parsing if input lines run out.
    }
  }

  // Determine the line index where the count for "secondary" items (analogous to M) is located.
  const secondaryCountLineNumber = numPrimaryItems + 1;

  // Validate that the line containing the secondary count actually exists.
  if (secondaryCountLineNumber >= contentLines.length) {
    console.error(`Input processing aborted: Secondary item count line expected at index ${secondaryCountLineNumber} is missing.`);
    return;
  }

  // Extract the count for "secondary" items.
  const secondaryItemCountStr = contentLines[secondaryCountLineNumber];
  const numSecondaryItems = Number.parseInt(secondaryItemCountStr, 10);

  // Validate the parsed secondary item count.
  if (Number.isNaN(numSecondaryItems) || numSecondaryItems < 0) {
    console.error(`Input processing aborted: Invalid secondary item count "${secondaryItemCountStr}". Expecting a non-negative integer.`);
    return;
  }

  // Process each positive-contributing item: increment its score.
  for (const itemIdentifier of positiveContributionList) {
    // Fetch the current score, defaulting to 0 if the item is encountered for the first time.
    const currentScore = scoreAccumulator.get(itemIdentifier) || 0;
    scoreAccumulator.set(itemIdentifier, currentScore + 1);
  }

  // Populate the list of negative-contributing items.
  // These items begin immediately after the secondary count line.
  const startOfSecondaryItems = secondaryCountLineNumber + 1;
  for (let currentLineIdx = 0; currentLineIdx < numSecondaryItems; ++currentLineIdx) {
    const sourceLineNumber = startOfSecondaryItems + currentLineIdx;
    if (sourceLineNumber < contentLines.length) {
      negativeContributionList.push(contentLines[sourceLineNumber]);
    } else {
      console.warn(`Warning: Input ended prematurely. Expected secondary item at line ${sourceLineNumber}, but it's missing.`);
      break; // Stop parsing if input lines run out.
    }
  }

  // Process each negative-contributing item: decrement its score.
  for (const itemIdentifier of negativeContributionList) {
    // Fetch the current score, defaulting to 0 if the item is encountered for the first time.
    const currentScore = scoreAccumulator.get(itemIdentifier) || 0;
    scoreAccumulator.set(itemIdentifier, currentScore - 1);
  }

  // Calculate the highest net score among all processed items.
  // Initialize with negative infinity to correctly find the maximum, even if all scores are negative.
  let highestAchievedScore = -Infinity;
  let anyScoresProcessed = false; // Flag to indicate if any items were actually scored.

  // Iterate through all the final scores stored in the accumulator.
  for (const individualScore of scoreAccumulator.values()) {
    anyScoresProcessed = true; // Mark that we have at least one score to consider.
    if (individualScore > highestAchievedScore) {
      highestAchievedScore = individualScore;
    }
  }

  // The problem implies that the final output should not be less than zero.
  // If no items were processed (e.g., N=0 and M=0), the score is 0.
  // Otherwise, take the maximum of 0 and the highest score found.
  const finalResultValue = Math.max(0, anyScoresProcessed ? highestAchievedScore : 0);

  // Output the computed result to the console.
  console.log(finalResultValue);
}

// Standard entry point for competitive programming environments in Node.js.
// Reads the entire content from standard input, decodes it as UTF-8,
// and then trims any leading/trailing whitespace (like an extra newline at EOF)
// before passing it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim());