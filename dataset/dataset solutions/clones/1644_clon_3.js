'use strict';

// This function serves as the primary entry point for processing incoming data.
// Its purpose is to parse the input, determine a specific metric, and then
// compute and display a corresponding rank.
function processInputData(rawInputString) {
  // First, split the entire raw input string into an array of individual lines.
  const inputLines = rawInputString.split('\n');

  // Next, focus on the very first line of the input.
  // Split this line by spaces to get an array of string tokens.
  const firstLineTokens = inputLines[0].split(' ');

  // Extract the first token from the first line and convert it into a floating-point number.
  // This value represents the core metric for our ranking calculation.
  const scoreMetric = parseFloat(firstLineTokens[0]);

  // Implement a basic validation step: check if the parsed scoreMetric is indeed a valid number.
  // If parsing fails (e.g., the input was not numeric), log an error and halt execution.
  // This is an added guard clause for robustness (Type III addition).
  if (isNaN(scoreMetric)) {
    console.error("Execution Aborted: The provided input could not be converted into a valid numeric score.");
    return; // Exit the function gracefully if input is invalid.
  }

  // Delegate the complex ranking logic to a dedicated helper function.
  // This promotes modularity and separation of concerns (Type III addition).
  const calculatedRank = computeRankBasedOnMetric(scoreMetric);

  // Finally, output the determined rank to the standard console.
  console.log(calculatedRank);
}

/**
 * Computes a rank value based on a given numeric metric, following a predefined tiered system.
 * This function encapsulates the core business logic for ranking.
 *
 * @param {number} metricValue The numeric score (e.g., points, value) that needs to be ranked.
 * @returns {number|undefined} The assigned rank (an integer), or `undefined` if the metric value
 *                             does not fall into any of the defined ranking tiers.
 */
function computeRankBasedOnMetric(metricValue) {
  // Define the ranking tiers. Each object specifies a minimum score for a given rank.
  // The tiers are ordered from highest minimum score to lowest to simplify the lookup logic.
  // This structured data array replaces the original cascading if-else if statements (Type III structural rewrite).
  const rankingTiers = [
    { thresholdLower: 1800, rankResult: 1 },
    { thresholdLower: 1600, rankResult: 2 },
    { thresholdLower: 1400, rankResult: 3 },
    { thresholdLower: 1200, rankResult: 4 },
    { thresholdLower: 1000, rankResult: 5 },
    { thresholdLower: 800, rankResult: 6 },
    { thresholdLower: 600, rankResult: 7 },
    { thresholdLower: 400, rankResult: 8 }
  ];

  let determinedRank = undefined; // Initialize with undefined, mirroring original behavior for out-of-range values.

  // Iterate through the predefined ranking tiers.
  // The loop will find the first tier whose minimum score is met by the metricValue.
  for (const currentTier of rankingTiers) {
    // If the metric value is greater than or equal to the current tier's lower threshold,
    // then this is the correct tier for the metricValue.
    if (metricValue >= currentTier.thresholdLower) {
      determinedRank = currentTier.rankResult; // Assign the corresponding rank.
      break; // Exit the loop as the rank has been found.
    }
  }

  // Return the rank that was found. If no tier's condition was met (i.e., metricValue is less than 400),
  // determinedRank will still be `undefined`, which matches the original script's implicit behavior.
  return determinedRank;
}

// This is the execution trigger for the program.
// It reads all data from standard input (typically '/dev/stdin' in competitive programming environments)
// as a UTF-8 encoded string and then passes it to our main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));