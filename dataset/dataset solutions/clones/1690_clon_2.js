/* This module processes input data to tally programming contest results. */
function ProcessResults(rawData) {
	// Split the entire raw input string into an array of individual lines.
	const lineFragments = rawData.split('\n');

	// The very first line indicates the total number of entries to process.
	const numEntries = parseInt(lineFragments[0], 10);

	// Initialize an object to store the tallies for each outcome category.
	let outcomeCounts = {
		"AC": 0,    // Accepted
		"WA": 0,    // Wrong Answer
		"TLE": 0,   // Time Limit Exceeded
		"RE": 0     // Runtime Error
	};

	// Iterate through each result entry, starting from the second line (index 1).
	for (let entryIndex = 1; entryIndex <= numEntries; ++entryIndex) {
		const currentOutcome = lineFragments[entryIndex];
		// Increment the count for the specific outcome. If not present, initialize to 1.
		outcomeCounts[currentOutcome] = (outcomeCounts[currentOutcome]) ? outcomeCounts[currentOutcome] + 1 : 1;
	}

	// Output the final tallies for each result type using template literals.
	console.log(`AC x ${outcomeCounts['AC']}`);
	console.log(`WA x ${outcomeCounts['WA']}`);
	console.log(`TLE x ${outcomeCounts['TLE']}`);
	console.log(`RE x ${outcomeCounts['RE']}`);
}

// Entry point: Read data from standard input and then process it.
const fileSystemModule = require('fs');
const standardInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf-8');
ProcessResults(standardInputData);