"use strict"; /* This directive ensures strict mode for better code quality */

function AnalyzeString(charSequence) {
	// Initialize counters for required metrics
	let swapOperations = 0,
		targetFoundCount = 0;
	// Iterate through each character in the provided sequence
	for (let currentPosition = 0; currentPosition < charSequence.length; currentPosition++) {
		// If the current character is not our designated target, skip to the next iteration
		if (charSequence[currentPosition] !== 'B') {
			continue;
		}

		// Calculate the number of swaps needed for this particular target character
		swapOperations += currentPosition - targetFoundCount;
		// Increment the count of successfully processed target characters
		targetFoundCount += 1;
	}

	// Output the final calculated total of swap operations
	displayFinalValue(swapOperations);
}

// A simple utility function to display results, replacing standard console.log
function displayFinalValue(resultantNumeric) {
	console.log(resultantNumeric);
}

// Main execution block: read input and pass it to the analysis function
AnalyzeString(require("node:fs").readFileSync("/dev/stdin", "utf-8"));