function processInputData(rawData) {

	// Variable to store the number of entities whose requests can be fulfilled.
	let satisfiedCount = 0;

	// Extract the number of participants from the first line of the input data.
	const participantCount = rawData.split('\n')[0].split(' ')[0];

	// Determine the total available quantity of the item from the input.
	const availableSupply = rawData.split('\n')[0].split(' ')[1];

	// Parse the individual demand values from the second line of the input string.
	let individualDemands = rawData.split('\n')[1].split(' ');

	// The following block sorts the requests to prioritize smaller demands first,
	// which is a strategy to maximize the number of satisfied participants given a limited supply.

	// Sort the array of individual demands in ascending numeric order.
	individualDemands.sort(function(firstVal, secondVal) {
		return firstVal - secondVal;
	});


	let currentDemandTotal = 0; // Accumulator for the total demand met so far.

	// Iterate through each participant's demand, starting from the smallest request.
	for (let idx = 0; idx < participantCount; idx++) {
		satisfiedCount = idx; // Update the count of successfully processed participants.

		// Add the current participant's demand to the running total of demands.
		currentDemandTotal += Number.parseInt(individualDemands[idx]);

		// Check if the accumulated demand has exceeded the available supply.
		if (currentDemandTotal > availableSupply) {
			console.log(Number.parseInt(satisfiedCount)); // Output the maximum number of satisfied entities.
			return; // Exit the function as no more participants can be satisfied due to insufficient supply.
		}

	}

	// If all participants' demands were met without exceeding the available supply,
	// then the count should be the total number of participants.
	satisfiedCount += 1;
	console.log(satisfiedCount); // Display the final count of satisfied entities.

}

// Read the standard input from the file system and pass it to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));