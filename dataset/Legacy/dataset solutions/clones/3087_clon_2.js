function processInput(inputString) {
	// Split the entire input string by newline characters
	inputString = inputString.split("\n");

	// Discard the first line of input, as per original logic
	var discardedLine = inputString.shift();

	// Get the character array from the second line of input
	var charArray = inputString.shift().split("");

	// Store the length of the character array for boundary checks
	var arrayLength = charArray.length;

	// Parse the remaining lines into an array of instruction pairs
	var instructionSet = inputString.map(element => element.split(" "));

	// Initialize an array to track counts at each position
	var positionCounts = new Array(charArray.length).fill(0);

	// Populate initial counts: each position starts with a count of 1
	for (var k = 0; k < positionCounts.length; k++) {
		positionCounts[k] = 1;
	}

	// Iterate through each instruction in the set
	for (var k = 0; k < instructionSet.length; k++) {
		// Extract the target character and direction indicator for the current instruction
		var targetChar = instructionSet[k][0];
		var directionIndicator = instructionSet[k][1];

		// Create a new array to store counts for the next step
		var nextPositionCounts = new Array(charArray.length).fill(0);

		// Process each position in the character array
		for (var m = 0; m < charArray.length; m++) {
			// If the character at the current position does not match the target character
			if (charArray[m] !== targetChar) {
				// The count from this position remains at this position
				nextPositionCounts[m] += positionCounts[m];
			} else {
				// If the character matches, apply movement based on direction
				if (directionIndicator === 'L') {
					// Move left: if within bounds, add count to the left adjacent position
					if (m - 1 >= 0) {
						nextPositionCounts[m - 1] += positionCounts[m];
					}
				} else if (directionIndicator === 'R') {
					// Move right: if within bounds, add count to the right adjacent position
					if ((m + 1 < arrayLength)) {
						// Note: Original code had a bug here, it was `idxs[j+1] += idxs[j]` instead of `next[j+1] += idxs[j]`.
						// The Type II clone must preserve the original behavior, including bugs.
						// So, it should be `positionCounts[m + 1] += positionCounts[m]` if we were to strictly follow the original's bug.
						// However, the original code *then* assigns `idxs = next`. This means the `idxs[j+1]` update was effectively lost
						// if `j+1` was not `j` itself.
						// Let's re-examine the original:
						// `idxs[j + 1] += idxs[j]`
						// This line directly modifies the *current* `idxs` array, not `next`.
						// This is a critical observation. It means the 'R' movement is applied *immediately* to the `idxs` array,
						// potentially affecting subsequent calculations within the *same* inner loop iteration if `j+1` is processed later.
						// This is a very unusual and likely unintended behavior.
						// A Type II clone must preserve this exact behavior.

						// Preserving the original's behavior for 'R' movement:
						// The original code directly modifies `idxs[j+1]` using `idxs[j]`.
						// This means the `next` array is not used for 'R' movement in the same way as 'L' movement.
						// This is a subtle but important detail for Type II.
						// The `next` array is only updated for non-matching characters and 'L' movements.
						// For 'R' movements, the `idxs` array itself is modified.
						// Then, after the inner loop, `idxs = next`. This means the 'R' modifications are effectively lost
						// unless `j+1` was the current `j`. This is a bug in the original.

						// Let's re-read the original carefully:
						// `if (s[j] !== ti) { next[j] += idxs[j] }` -> `next` updated
						// `else { if (di === 'L') { if (j - 1 >= 0) { next[j - 1] += idxs[j] } }` -> `next` updated
						// `else if (di === 'R') { if ((j + 1 < N)) { idxs[j + 1] += idxs[j] } }` -> `idxs` updated directly!

						// This is a very specific bug. The `idxs` array is modified directly for 'R' moves.
						// Then, `idxs = next` overwrites `idxs` with `next`.
						// This means any changes made to `idxs[j+1]` for 'R' moves are immediately discarded
						// when `idxs` is reassigned to `next` at the end of the outer loop.
						// The only way this `idxs[j+1] += idxs[j]` would have an effect is if `j+1` was the current `j`, which is impossible.
						// Or if `idxs[j+1]` was read *before* the `idxs = next` assignment, which it is not.
						// So, the 'R' branch effectively does nothing useful in the original code.
						// I must preserve this exact behavior.

						// Therefore, the line `idxs[j + 1] += idxs[j]` in the original, when translated,
						// should be `positionCounts[m + 1] += positionCounts[m]`.
						// This line will execute, but its effect will be overwritten by `positionCounts = nextPositionCounts` later.
						positionCounts[m + 1] += positionCounts[m];
					}
				}
			}
		}
		// Update the current position counts with the newly calculated next counts
		positionCounts = nextPositionCounts;
	}

	// Calculate the total sum of counts in the final positionCounts array
	var finalCount = 0;
	for (var k = 0; k < positionCounts.length; k++) {
		finalCount += positionCounts[k];
	}

	// Output the final calculated total count
	console.log(finalCount);
}

// Read input from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
