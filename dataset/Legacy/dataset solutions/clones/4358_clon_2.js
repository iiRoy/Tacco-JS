function ProcessInput(rawData) {
	// Helper function for numerical sorting
	function numericSorter(valA, valB) {
		return valA - valB;
	}

	// Process the raw input string
	let processedLines = rawData.trim().split("\n").map(function(lineSegment) {
		return lineSegment.split(" ");
	});

	// Parse the first line of input into specific variables
	const firstLineValues = processedLines[0].map(element => parseInt(element, 10));

	const sugarWaterUnitA = firstLineValues[0] * 100; // Water unit A in grams
	const sugarWaterUnitB = firstLineValues[1] * 100; // Water unit B in grams
	const sugarUnitC = firstLineValues[2];           // Sugar unit C in grams
	const sugarUnitD = firstLineValues[3];           // Sugar unit D in grams
	const maxConcentrationRatio = firstLineValues[4]; // Max sugar concentration ratio (E)
	const maxTotalWeight = firstLineValues[5];       // Max total weight (F)

	// Generate all possible water amounts (A*i + B*j)
	let waterSugarMixtures = [];
	let currentSum;
	for (let waterIdx = 0; waterIdx * sugarWaterUnitA <= maxTotalWeight; waterIdx++) {
		currentSum = sugarWaterUnitA * waterIdx;
		for (let waterUnitBCount = 0; currentSum + waterUnitBCount * sugarWaterUnitB <= maxTotalWeight; waterUnitBCount++) {
			waterSugarMixtures.push(currentSum + sugarWaterUnitB * waterUnitBCount);
		}
	}

	// Sort and remove duplicate water amounts
	waterSugarMixtures.sort(numericSorter);
	waterSugarMixtures = waterSugarMixtures.filter(function (item, idx, arrayRef) {
		return arrayRef.indexOf(item) === idx;
	});

	// Calculate the maximum possible sugar weight based on concentration limit
	const maxSugarWeight = Math.floor(maxTotalWeight * maxConcentrationRatio / (100 + maxConcentrationRatio));

	// Generate all possible sugar amounts (C*i + D*j)
	let sugarAmounts = [];
	for (let sugarIdx = 0; sugarIdx * sugarUnitC <= maxSugarWeight; sugarIdx++) {
		currentSum = sugarUnitC * sugarIdx;
		for (let sugarUnitDCount = 0; currentSum + sugarUnitDCount * sugarUnitD <= maxSugarWeight; sugarUnitDCount++) {
			sugarAmounts.push(currentSum + sugarUnitD * sugarUnitDCount);
		}
	}

	// Sort and remove duplicate sugar amounts
	sugarAmounts.sort(numericSorter);
	sugarAmounts = sugarAmounts.filter(function (item, idx, arrayRef) {
		return arrayRef.indexOf(item) === idx;
	});

	// Create a bitmap for quick lookup of available sugar amounts
	let sugarPresenceMap = [];
	for (let bitMapIdx = 0; bitMapIdx <= maxSugarWeight; bitMapIdx++) {
		sugarPresenceMap.push(0);
	}
	for (let listIter of sugarAmounts) {
		sugarPresenceMap[listIter] = 1;
	}

	// Initialize variables for tracking the best density
	let currentMaxDensity = 0;
	let resultPair = [0, 0]; // [total_weight, sugar_weight]

	let minSugarLimit, maxSugarLimit;
	// Iterate through possible water amounts
	for (let mixtureIter of waterSugarMixtures) {
		// Calculate the allowed range for sugar for the current water amount
		minSugarLimit = Math.round(mixtureIter * currentMaxDensity); // Lower bound based on current best density
		maxSugarLimit = Math.min(Math.floor(mixtureIter * maxConcentrationRatio / 100), maxTotalWeight - mixtureIter); // Upper bound based on max concentration and total weight

		// Iterate through possible sugar amounts within the allowed range
		for (let sugarAmountIter = minSugarLimit; sugarAmountIter <= maxSugarLimit; sugarAmountIter++) {
			// Check if this sugar amount is valid and hasn't been processed for this water amount
			if (sugarPresenceMap[sugarAmountIter] === 1) {
				// If the current density is better, update the result
				if ((sugarAmountIter / mixtureIter) >= currentMaxDensity) {
					resultPair[0] = mixtureIter + sugarAmountIter;
					resultPair[1] = sugarAmountIter;
					currentMaxDensity = sugarAmountIter / mixtureIter;
				}
				// Mark this sugar amount as processed for this water amount to avoid redundant checks
				// This is a crucial optimization for performance, effectively "consuming" the sugar amount
				// for a given water amount once it's considered.
				sugarPresenceMap[sugarAmountIter] = 0;
			}
		}
	}
	// Output the final result
	console.log("%d %d", Math.round(resultPair[0]), Math.round(resultPair[1]));
}

// Read input from stdin and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
