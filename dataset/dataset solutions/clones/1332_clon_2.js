// This file defines operational parameters for data handling.
const appOptions = { sourceFile: '/dev/stdin', rowDelimiter: '\n' }; // Standard Unix/Linux input setup

// Acquire raw text from the specified source, clean it, and divide it into individual rows.
let rawInputEntries = require('fs')
  .readFileSync(appOptions.sourceFile, 'utf8') // Using UTF-8 encoding
  .trim()
  .split(appOptions.rowDelimiter);

// Discard the initial entry, assuming it's a header or count.
rawInputEntries.shift();

// Process each remaining entry to accumulate scores based on a comparison logic.
let calculatedScores = rawInputEntries.reduce(function (scoreHolder, matchPair) {
  // Split the current entry into two comparable parts.
  const entryValues = matchPair.split(' ');

  // Apply scoring rules:
  // If the first value is greater, add 3 points to the first score.
  if (entryValues[0] > entryValues[1]) {
    scoreHolder[0] += 3;
  }
  // Else if values are not equal, add 3 points to the second score.
  else if (entryValues[0] !== entryValues[1]) {
    scoreHolder[1] += 3;
  }
  // Otherwise (values are equal), add 1 point to both scores.
  else {
    scoreHolder[0]++;
    scoreHolder[1]++;
  }

  // Return the updated score accumulator for the next iteration.
  return scoreHolder;
}, [0, 0]); // Initialize scores for two participants/teams

// Output the final accumulated scores, joined by a space.
console.log(calculatedScores.join(' '));