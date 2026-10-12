const [firstLineVal, ...inputLines] = require('fs').readFileSync('/dev/stdin', 'utf8').split(/\n/);

// This object will store the frequency of each outcome.
const outcomeCounts = {};

// Iterate through each submitted line to tally results.
for (const currentOutcome of inputLines) {
  // Increment the count for the current outcome, initializing to 0 if not present.
  outcomeCounts[currentOutcome] = (outcomeCounts[currentOutcome] || 0) + 1;
}

// Define the standard categories for output.
const standardCategories = ['AC', 'WA', 'TLE', 'RE'];

// Print the final counts for each category.
for (const statusType of standardCategories) {
  console.log(`${statusType} x ${outcomeCounts[statusType]}`);
}
