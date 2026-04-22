// This function processes incoming raw string information
function ProcessData(rawData) {
	let parsedLines = rawData.split('\n');

	// Parse the initial numeric value from the first line
	const initialValue = Number.parseInt(parsedLines[0], 10);
	// Convert the second line into an array of integer numerators
	const numeratorArray = parsedLines[1].split(' ').map(anItem => Number.parseInt(anItem, 10));
	// Convert the third line into an array of integer denominators
	const denominatorArray = parsedLines[2].split(' ').map(anItem => Number.parseInt(anItem, 10));

	// Calculate the three primary ratios
	const firstRatio = numeratorArray[0] / denominatorArray[0];
	const secondRatio = numeratorArray[1] / denominatorArray[1];
	const thirdRatio = numeratorArray[2] / denominatorArray[2];

	// Declare variables to store indices based on the sorted order of ratios
	let bestIndex = 0;
	let middleIndex = 0;
	let worstIndex = 0;

	// Determine the descending order of the calculated ratios
	if (firstRatio >= secondRatio) {
		if (secondRatio >= thirdRatio) { // Order: first >= second >= third
			bestIndex = 0;
			middleIndex = 1;
			worstIndex = 2;
		} else {
			if (firstRatio >= thirdRatio) { // Order: first >= third > second
				bestIndex = 0;
				middleIndex = 2;
				worstIndex = 1;
			} else { // Order: third > first >= second
				bestIndex = 2;
				middleIndex = 0;
				worstIndex = 1;
			}
		}
	} else {
		if (firstRatio >= thirdRatio) { // Order: second > first >= third
			bestIndex = 1;
			middleIndex = 0;
			worstIndex = 2;
		} else {
			if (secondRatio >= thirdRatio) { // Order: second >= third > first
				bestIndex = 1;
				middleIndex = 2;
				worstIndex = 0;
			} else { // Order: third > second > first
				bestIndex = 2;
				middleIndex = 1;
				worstIndex = 0;
			}
		}
	}

	// Initialize the maximum possible value with the initial input
	let finalResult = initialValue;

	// Apply a series of conditional calculations based on the ratios
	if (numeratorArray[bestIndex] / denominatorArray[bestIndex] >= 1.0) {
		if (numeratorArray[middleIndex] / denominatorArray[middleIndex] >= 1.0) {
			if (numeratorArray[worstIndex] / denominatorArray[worstIndex] >= 1.0) {
				// All three ratios are greater than or equal to 1.0
				finalResult = Math.floor(initialValue / denominatorArray[bestIndex]) * numeratorArray[bestIndex] +
							  Math.floor((initialValue % denominatorArray[bestIndex]) / denominatorArray[middleIndex]) * numeratorArray[middleIndex] +
							  Math.floor((initialValue % denominatorArray[bestIndex] % denominatorArray[middleIndex]) / denominatorArray[worstIndex]) * numeratorArray[worstIndex] +
							  initialValue % denominatorArray[bestIndex] % denominatorArray[middleIndex] % denominatorArray[worstIndex];
			} else {
				// The 'worstIndex' ratio is less than 1.0, others are >= 1.0
				let tempValue = Math.floor(initialValue / numeratorArray[worstIndex]) * denominatorArray[worstIndex] + initialValue % numeratorArray[worstIndex];
				finalResult = Math.floor(tempValue / denominatorArray[bestIndex]) * numeratorArray[bestIndex] +
							  Math.floor((tempValue % denominatorArray[bestIndex]) / denominatorArray[middleIndex]) * numeratorArray[middleIndex] +
							  tempValue % denominatorArray[bestIndex] % denominatorArray[middleIndex];
			}
		} else {
			// The 'middleIndex' ratio is less than 1.0, and potentially 'worstIndex' too
			let tempValue = Math.floor(initialValue / numeratorArray[worstIndex]) * denominatorArray[worstIndex] +
							Math.floor((initialValue % numeratorArray[worstIndex]) / numeratorArray[middleIndex]) * denominatorArray[middleIndex] +
							initialValue % numeratorArray[worstIndex] % numeratorArray[middleIndex];
			finalResult = Math.floor(tempValue / denominatorArray[bestIndex]) * numeratorArray[bestIndex] + tempValue % denominatorArray[bestIndex];
		}
	} else {
		// The 'bestIndex' ratio is less than 1.0, and potentially others too
		finalResult = Math.floor(initialValue / numeratorArray[worstIndex]) * denominatorArray[worstIndex] +
					  Math.floor((initialValue % numeratorArray[worstIndex]) / numeratorArray[middleIndex]) * denominatorArray[middleIndex] +
					  Math.floor((initialValue % numeratorArray[worstIndex] % numeratorArray[middleIndex]) / numeratorArray[bestIndex]) * numeratorArray[bestIndex] +
					  initialValue % numeratorArray[worstIndex] % numeratorArray[middleIndex] % numeratorArray[bestIndex];
	}

	// Output the computed maximum value
	console.log(finalResult);
}

// The following line should not be modified; it handles input/output operations and invokes the primary processing function.
ProcessData(require("node:fs").readFileSync("/dev/stdin", "utf8"));