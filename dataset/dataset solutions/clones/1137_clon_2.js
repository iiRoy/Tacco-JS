/*
 * This script calculates the maximum value that can be obtained
 * by selecting items with given weights and values, subject to a
 * maximum weight capacity, using a dynamic programming approach.
 * It first processes input to generate a list of available goods
 * that might include multiple instances of the same base item type.
 */

function maximizeProfit() {
	// dpTable will store the maximum value for a given number of items and weight capacity.
	var dpTable = [];

	// Initialize the dpTable with empty arrays for each item row.
	for (var itemIdx = 0; itemIdx <= totalItemsCount; itemIdx++) {
		dpTable[itemIdx] = [];
	}

	// For zero items, the value is always zero, regardless of capacity.
	for (var currentCapacity = 0; currentCapacity <= maxBagCapacity; currentCapacity++) {
		dpTable[0][currentCapacity] = 0;
	}

	// For zero capacity, the value is always zero, regardless of items.
	for (var itemIdx = 0; itemIdx <= totalItemsCount; itemIdx++) {
		dpTable[itemIdx][0] = 0;
	}

	// Fill the dpTable using the knapsack dynamic programming logic.
	// Iterate through each item.
	for (var itemIdx = 1; itemIdx <= totalItemsCount; itemIdx++) {
		// Iterate through each possible weight capacity.
		for (var currentCapacity = 1; currentCapacity <= maxBagCapacity; currentCapacity++) {
			var currentItemWeight = availableGoods[itemIdx].weightMeasure;
			var currentItemValue = availableGoods[itemIdx].valueMetric;

			// Check if the current item's weight can fit into the current capacity.
			if (currentItemWeight <= currentCapacity) {
				// Option 1: Include the current item.
				// Value = current item's value + value from remaining capacity with previous items.
				var valueIncludingCurrent = currentItemValue + dpTable[itemIdx - 1][currentCapacity - currentItemWeight];

				// Option 2: Exclude the current item.
				// Value = value from previous items with the same capacity.
				var valueExcludingCurrent = dpTable[itemIdx - 1][currentCapacity];

				// Take the maximum of the two options.
				if (valueIncludingCurrent > valueExcludingCurrent) {
					dpTable[itemIdx][currentCapacity] = valueIncludingCurrent;
				} else {
					dpTable[itemIdx][currentCapacity] = valueExcludingCurrent;
				}
			} else {
				// If the item's weight is greater than the current capacity,
				// it cannot be included. So, the value is the same as without this item.
				dpTable[itemIdx][currentCapacity] = dpTable[itemIdx - 1][currentCapacity];
			}
		}
	}
	// The final result is the maximum value for all items and the total capacity.
	return dpTable[totalItemsCount][maxBagCapacity];
}

// --- Main execution flow starts here ---

// Read raw data from standard input.
var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input: trim whitespace and split into individual lines.
var lineFragments = (rawData.trim()).split("\n");

// Parse the first line to get the number of initial item types and the maximum bag capacity.
var configParams = (lineFragments.shift()).split(" ").map(Number);
var initialItemTypes = configParams[0]; // N from original
var maxBagCapacity = configParams[1];   // W from original

// An object to store aggregated goods, mapping total weight to the maximum value for that weight.
// This handles the "multiple copies" scenario by consolidating items.
var aggregatedGoods = {};

// Loop through each initial item type provided in the input.
for (var itemTypeIndex = 1; itemTypeIndex <= initialItemTypes; itemTypeIndex++) {
	// Get the weight and value for the current item type.
	var itemDataLine = (lineFragments.shift()).split(" ").map(Number);
	var baseValue = itemDataLine[0];
	var baseWeight = itemDataLine[1];

	// Create multiple instances of the current item type up to the total capacity.
	// This effectively transforms the problem to 0/1 knapsack on a modified item set.
	for (var quantityFactor = 1; (baseWeight * quantityFactor) <= maxBagCapacity; quantityFactor++) {
		var currentTotalWeight = baseWeight * quantityFactor;
		var currentTotalValue = baseValue * quantityFactor;

		// Check if an item with this total weight already exists in aggregatedGoods.
		if (currentTotalWeight in aggregatedGoods) {
			// If a higher value for this weight already exists, skip.
			if (aggregatedGoods[currentTotalWeight] > currentTotalValue) {
				continue;
			}
		}
		// Store or update the maximum value for this specific total weight.
		aggregatedGoods[currentTotalWeight] = currentTotalValue;
	}
}

// Convert the aggregated goods object into an array suitable for the knapsack function.
// The first element is null to align item indexing with 1-based array logic in knapsack.
var availableGoods = [null];
for (var weightKey in aggregatedGoods) {
	// Add each unique weight-value pair as an item to the array.
	availableGoods.push({
		valueMetric: aggregatedGoods[weightKey],
		weightMeasure: parseInt(weightKey) // Ensure weight is a number
	});
}

// Determine the actual number of distinct items to consider for the knapsack problem.
var totalItemsCount = availableGoods.length - 1;

// Execute the knapsack algorithm to find the optimal solution.
var finalOptimalValue = maximizeProfit();

// Output the calculated maximum value.
console.log(finalOptimalValue);