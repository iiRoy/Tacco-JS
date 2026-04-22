'use strict'; // Enforce strict parsing and error handling for cleaner code.

/**
 * Executes a dynamic programming algorithm to calculate the maximum achievable
 * "happiness" or "pleasure" score over a sequence of days, adhering to a constraint
 * that the same activity cannot be chosen on consecutive days.
 *
 * The input is read from standard input, typically structured as:
 * - The first line contains a single integer, N, representing the total number of days.
 * - The following N lines each contain three space-separated integers,
 *   representing the pleasure scores for activity types A, B, and C respectively
 *   on that specific day.
 *
 * @param {string} rawInputContent - The complete raw string content read from the input source.
 *   This string is expected to contain all lines of input data.
 */
(function executeHappinessMaximization(rawInputContent) {
  // Define a constant for the number of distinct activity types available each day.
  // In this problem, there are always three choices (A, B, C).
  const NUMBER_OF_ACTIVITY_CHOICES = 3;

  /**
   * A utility function to parse a single line of text into an array of numbers.
   * It handles trimming whitespace and converting string tokens to numeric values.
   *
   * @param {string} lineSegment - A single line of text from the input.
   * @returns {number[]} An array of numbers parsed from the line.
   */
  const convertSegmentToNumericArray = (lineSegment) => {
    // Basic validation: ensure the input is a non-empty string.
    if (typeof lineSegment !== 'string' || lineSegment.trim() === '') {
      console.warn('Warning: Encountered an empty or non-string line during data parsing. Skipping.');
      return []; // Return an empty array for invalid lines.
    }
    // Trim whitespace, split by one or more spaces, and convert each part to a number.
    return lineSegment.trim().split(/\s+/).map(Number);
  };

  // --- Input Data Processing and Initial Validation ---
  let processedActivityData; // This will store the 2D array of activity scores.
  let totalScheduledDays;    // N, the number of days for the DP calculation.

  try {
    // First, clean up the overall input string by removing any extraneous leading/trailing whitespace.
    const sanitizedInputText = rawInputContent.trim();
    if (sanitizedInputText === '') {
      console.error('Fatal Error: The provided input content is entirely empty. Cannot proceed.');
      process.exit(1); // Terminate execution with an error code.
    }

    // Split the sanitized input into individual lines and parse each line into an array of numbers.
    // The result is a 2D array where each inner array corresponds to a line of input.
    processedActivityData = sanitizedInputText.split('\n').map(convertSegmentToNumericArray);

    // Initial structural check: ensure there's at least one line (for N) and it's not empty.
    if (processedActivityData.length === 0 || processedActivityData[0].length === 0) {
      console.error('Fatal Error: Input data is severely malformed; cannot extract total days (N).');
      process.exit(1);
    }

    // Extract the total number of days from the first element of the first line.
    totalScheduledDays = processedActivityData[0][0];

    // Validate the extracted 'totalScheduledDays' value. It must be a positive integer.
    if (totalScheduledDays <= 0 || !Number.isInteger(totalScheduledDays)) {
      console.error(`Fatal Error: Invalid number of scheduled days (N) provided: ${totalScheduledDays}. N must be a positive integer.`);
      process.exit(1);
    }

  } catch (dataParsingError) {
    // Catch any unexpected errors during the input processing phase.
    console.error('Fatal Error: An unhandled exception occurred during input data parsing:', dataParsingError);
    process.exit(1);
  }

  // --- Dynamic Programming Table Initialization ---
  // `maximumAchievableScores` will serve as our DP table (memoization table).
  // `maximumAchievableScores[d][a]` will store the maximum happiness score
  // achievable up to day `d`, by choosing activity type `a` on day `d`.
  //
  // The table is sized `(totalScheduledDays + 1)` rows by `NUMBER_OF_ACTIVITY_CHOICES` columns.
  // Row 0 acts as a base case (before any activities are chosen), initialized to all zeros.
  const maximumAchievableScores = Array.from({ length: totalScheduledDays + 1 }, () =>
    new Array(NUMBER_OF_ACTIVITY_CHOICES).fill(0)
  );

  // --- Core Dynamic Programming Calculation Loop ---
  // Iterate through each day, starting from the first actual day (index 1) up to `totalScheduledDays`.
  for (let currentDayIndex = 1; currentDayIndex <= totalScheduledDays; currentDayIndex++) {
    // Retrieve the pleasure scores for the activities available on the `currentDayIndex`.
    // Note: The input data's day indexing starts from 1, so `processedActivityData[1]` is for Day 1.
    const pleasureValuesForCurrentDay = processedActivityData[currentDayIndex];

    // Robustness check: ensure we have valid activity data for the current day.
    if (!pleasureValuesForCurrentDay || pleasureValuesForCurrentDay.length !== NUMBER_OF_ACTIVITY_CHOICES) {
      console.error(`Fatal Error: Activity data for day ${currentDayIndex} is missing or malformed. Expected ${NUMBER_OF_ACTIVITY_CHOICES} values.`);
      process.exit(1);
    }

    // Iterate through each possible activity choice for the `currentDayIndex`.
    for (let chosenActivityType = 0; chosenActivityType < NUMBER_OF_ACTIVITY_CHOICES; chosenActivityType++) {
      // The problem constraint: cannot choose the same activity on consecutive days.
      // This means if `chosenActivityType` is picked today, yesterday's activity
      // must have been one of the *other* two activity types.

      // Calculate the indices of the two alternative activities from the previous day.
      // Using modulo arithmetic to cycle through the activity types (0, 1, 2).
      const firstAlternativePrevActivity = (chosenActivityType + 1) % NUMBER_OF_ACTIVITY_CHOICES;
      const secondAlternativePrevActivity = (chosenActivityType + 2) % NUMBER_OF_ACTIVITY_CHOICES;

      // Fetch the maximum scores achieved up to the previous day (`currentDayIndex - 1`),
      // ending with each of the two alternative previous activity types.
      const scoreIfPreviousWasAlt1 = maximumAchievableScores[currentDayIndex - 1][firstAlternativePrevActivity];
      const scoreIfPreviousWasAlt2 = maximumAchievableScores[currentDayIndex - 1][secondAlternativePrevActivity];

      // The maximum score for the `currentDayIndex` ending with `chosenActivityType` is:
      // (The maximum of the scores from the two possible previous day's paths)
      // + (The pleasure gained from `chosenActivityType` on the `currentDayIndex`).
      maximumAchievableScores[currentDayIndex][chosenActivityType] =
        Math.max(scoreIfPreviousWasAlt1, scoreIfPreviousWasAlt2) + pleasureValuesForCurrentDay[chosenActivityType];
    }
  }

  // --- Final Result Aggregation ---
  // After the DP table is fully populated, the overall maximum happiness score
  // for all `totalScheduledDays` will be the highest value found in the last row
  // of the `maximumAchievableScores` table (i.e., for `totalScheduledDays`).
  const scoresOnFinalDay = maximumAchievableScores[totalScheduledDays];

  // Validate that the final day scores array is not empty.
  if (!scoresOnFinalDay || scoresOnFinalDay.length === 0) {
    console.error('Fatal Error: No scores were computed for the final day. This indicates an issue with DP table population.');
    process.exit(1);
  }

  // Find the maximum value within the `scoresOnFinalDay` array.
  // Using a loop for explicit clarity, instead of `Math.max(...array)` or `Math.max.apply`.
  let overallMaxAttainableScore = -Infinity; // Initialize with the smallest possible number.
  for (const scoreEntry of scoresOnFinalDay) {
    if (scoreEntry > overallMaxAttainableScore) {
      overallMaxAttainableScore = scoreEntry;
    }
  }

  // Output the final computed maximum score to standard output.
  console.log(overallMaxAttainableScore);

// The Immediately Invoked Function Expression (IIFE) is called immediately
// with the content read from `/dev/stdin`. This is a common pattern in
// competitive programming environments for handling input.
})(require('fs').readFileSync('/dev/stdin', 'utf8'));