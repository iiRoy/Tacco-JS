let itemDetails = [
	// Each inner array represents a product type with its quantity per unit, cost per unit, and maximum available units.
	[500 * 3, 850 * 3 * 0.88, 4],
	[300 * 4, 550 * 4 * 0.85, 5],
	[200 * 5, 380 * 5 * 0.8, 6],
	[500, 850, 11],
	[300, 550, 17],
	[200, 380, 26]
];

/**
 * Calculates the minimum cost to achieve a specific target quantity
 * by combining different product types.
 * @param {number} targetQuantity - The desired total quantity.
 * @returns {number} The lowest possible cost.
 */
const calculateMinimumCost = function(targetQuantity) {
	let lowestValue = 1e8; // Initialize with a very high number to find the minimum
	let itemCounts = [0, 0, 0, 0, 0, 0]; // Array to store the count for each item type

	// Nested loops to iterate through all possible combinations of item counts
	for (itemCounts[0] = 0; itemCounts[0] < itemDetails[0][2]; itemCounts[0]++) {
		for (itemCounts[1] = 0; itemCounts[1] < itemDetails[1][2]; itemCounts[1]++) {
			for (itemCounts[2] = 0; itemCounts[2] < itemDetails[2][2]; itemCounts[2]++) {
				for (itemCounts[3] = 0; itemCounts[3] < itemDetails[3][2]; itemCounts[3]++) {
					for (itemCounts[4] = 0; itemCounts[4] < itemDetails[4][2]; itemCounts[4]++) {
						for (itemCounts[5] = 0; itemCounts[5] < itemDetails[5][2]; itemCounts[5]++) {
							let totalQuantity = 0; // Current total quantity for this combination
							let currentCost = 0; // Current total cost for this combination

							// Calculate total quantity and cost for the current combination
							for (let itemTypeIndex = 0; itemTypeIndex < 6; itemTypeIndex++) {
								totalQuantity += itemCounts[itemTypeIndex] * itemDetails[itemTypeIndex][0];
								currentCost += itemCounts[itemTypeIndex] * itemDetails[itemTypeIndex][1];
							}

							// If the total quantity matches the target, update the minimum cost
							if (totalQuantity === targetQuantity) {
								lowestValue = Math.min(currentCost, lowestValue);
							}
						}
					}
				}
			}
		}
	}
	return lowestValue; // Return the minimum cost found
};

let inputLines = []; // Array to store input lines from stdin

// Configure stdin to read data
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks
process.stdin.on('data', function (dataBlock) {
	// Split the chunk by newline and add each line to the inputLines array
	dataBlock.trim().split('\n').forEach(function(singleLine) {
		inputLines.push(singleLine);
	});
});

// Event listener for the end of stdin input
process.stdin.on('end', function() {
	// Process each collected input line
	for (let lineIterator = 0; lineIterator < inputLines.length; lineIterator++) {
		const parsedValue = parseInt(inputLines[lineIterator].trim(), 10); // Parse string to integer

		// If the parsed value is 0, terminate execution
		if (parsedValue === 0) {
			return;
		}
		// Otherwise, calculate and print the minimum cost for the current input
		console.log(calculateMinimumCost(parsedValue));
	}
});