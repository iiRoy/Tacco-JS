var consoleOutput = console.log;

if (typeof process !== "undefined") {
	var rawInputData = "";
	process.stdin.resume();
	process.stdin.setEncoding('utf8');
	process.stdin.on('data', function (chunk) {
		rawInputData += chunk;
	});
	process.stdin.on('end', function () {
		var inputLines = rawInputData.split("\n");
		processInput(inputLines);
	});
}

function processInput(rawInputLines) {
	// Apply the initial mapping to all lines, including the first,
	// replicating the original's parsing behavior.
	const processedLines = rawInputLines.map(function (lineContent) {
		const parts = lineContent.split(" ");
		if (parts.length >= 2) {
			return parts.map(function (part) {
				return Number(part);
			});
		} else {
			return Number(lineContent);
		}
	});

	// Extract the first line which contains N and W
	const firstLineTuple = processedLines.shift();
	const numItems = firstLineTuple.shift(); // N
	const maxWeight = firstLineTuple.shift(); // W

	// The remaining lines are the item details (value and weight pairs)
	const itemDetails = processedLines;

	// Call the knapsack solver function
	const result = calculateKnapsackValue(itemDetails, maxWeight);
	consoleOutput(result);
}

function calculateKnapsackValue(items, capacity) {
	let currentDpState = {}; // Corresponds to 'mem' in the original code
	let previousDpState = {}; // Corresponds to 'swap' in the original code

	// The original code implicitly handles the base case (no items) by starting with empty 'mem' and 'swap'.
	// For the first item, 'swap' is empty, and the inner loop doesn't run.
	// Then, `mem[wi] = vi` is set if `wi <= W`. This effectively initializes the DP table.

	for (let itemIdx = 0; itemIdx < items.length; itemIdx++) {
		const itemValue = items[itemIdx][0];
		const itemWeight = items[itemIdx][1];

		previousDpState = currentDpState; // Store the state from (i-1) items
		currentDpState = {}; // Reset for current item (i)

		// To ensure the 'break' condition behaves consistently,
		// iterate through existing weights in ascending order.
		const sortedWeights = Object.keys(previousDpState).map(Number).sort((a, b) => a - b);

		for (const existingWeight of sortedWeights) {
			// Option 1: Don't take the current item.
			// The value for `existingWeight` in `currentDpState` is at least what it was in `previousDpState`.
			currentDpState[existingWeight] = Math.max(currentDpState[existingWeight] || 0, previousDpState[existingWeight]);

			// Option 2: Take the current item.
			const newWeightIfTaken = existingWeight + itemWeight;
			const newValueIfTaken = previousDpState[existingWeight] + itemValue;

			if (newWeightIfTaken <= capacity) {
				// Update `currentDpState` for `newWeightIfTaken` if taking the current item yields a better value.
				currentDpState[newWeightIfTaken] = Math.max(currentDpState[newWeightIfTaken] || 0, newValueIfTaken);
			} else {
				// This 'break' is an optimization from the original code.
				// If `existingWeight + itemWeight` exceeds capacity, and `existingWeight` is sorted,
				// then all subsequent `existingWeight` values will also result in `newWeightIfTaken` exceeding capacity.
				break;
			}
		}

		// Handle the case where the current item is taken alone.
		// This is equivalent to the original's `if ((swap[wi] <= vi || !swap[wi]) && (mem[wi] <= vi || !mem[wi])) { mem[wi] = vi; }`
		// It ensures that if the current item itself can be placed, its value is considered.
		if (itemWeight <= capacity) {
			currentDpState[itemWeight] = Math.max(currentDpState[itemWeight] || 0, itemValue);
		}
	}

	// Find the maximum value in the final DP state.
	// The original code iterates from `W` down to `1` and prints the first non-zero value found.
	// This is equivalent to finding the maximum value among all achievable weights.
	let overallMaxAchievedValue = 0;
	const allAchievedValues = Object.values(currentDpState);

	if (allAchievedValues.length > 0) {
		overallMaxAchievedValue = Math.max(...allAchievedValues);
	}

	return overallMaxAchievedValue;
}
