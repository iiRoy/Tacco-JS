'use strict'; // Enforce strict parsing and error handling for the script.

// --- Input Acquisition and Initial Processing ---
// Retrieve the raw content from standard input.
// Convert the buffer to a UTF-8 string, remove any leading or trailing whitespace.
const rawDataString = require("fs").readFileSync("/dev/stdin", "utf8").trim();

// Split the processed string into an array of individual value tokens.
// Using a regular expression to split by one or more whitespace characters
// makes the parsing more robust than splitting by a single space.
const extractedTokens = rawDataString.split(/\s+/);

// Assign the first three tokens to distinct, more descriptive variables.
// If fewer than three tokens are present, the subsequent variables will be 'undefined',
// which mirrors the implicit behavior of the original script.
const firstComparisonTarget = extractedTokens[0];
const secondComparisonTarget = extractedTokens[1];
const thirdComparisonTarget = extractedTokens[2]; // Can be 'undefined' if input is short.

// --- Core Logic: Determining Similarity Pattern ---
// Initialize a variable to store the integer result (1, 2, or 3).
let calculatedSimilarityCode = 0;

// Employ a Set data structure to efficiently count the number of unique values among the three targets.
// Adding elements to a Set automatically handles duplicates, ensuring only unique entries are stored.
const uniqueElementSet = new Set();
uniqueElementSet.add(firstComparisonTarget);
uniqueElementSet.add(secondComparisonTarget);
uniqueElementSet.add(thirdComparisonTarget); // 'undefined' will be treated as a unique value if present.

// The size of the Set directly corresponds to the number of distinct values.
const distinctValueCount = uniqueElementSet.size;

// Based on the count of distinct values, assign the appropriate similarity code.
// This 'if-else if-else' structure replaces the series of independent 'if' statements,
// providing a clearer and more efficient control flow.
if (distinctValueCount === 1) {
  // Scenario 1: All three values are strictly identical (e.g., "A", "A", "A").
  calculatedSimilarityCode = 1;
} else if (distinctValueCount === 3) {
  // Scenario 3: All three values are strictly different (e.g., "A", "B", "C").
  calculatedSimilarityCode = 3;
} else { // This implicitly means distinctValueCount === 2
  // Scenario 2: Exactly two values are strictly identical, and one is different
  // (e.g., "A", "A", "B" or "A", "B", "A" or "B", "A", "A").
  // This also covers cases like "1", "1", undefined, which results in 2 unique items.
  calculatedSimilarityCode = 2;
}

// --- Result Presentation ---
// Output the final calculated similarity code to the standard output.
console.log(calculatedSimilarityCode);

// A final note indicating the completion of the comparison process.
// This is an additional comment fragment.
// End of script for value pattern identification.