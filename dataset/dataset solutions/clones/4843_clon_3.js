// This module manages the distribution and auditing of candy within various containers.
function ProcessCandyDistribution(rawInputData) {
	// Divide the incoming string data into individual lines for processing.
	const dataLines = rawInputData.split('\n');
	let totalCandiesRemoved = 0; // Accumulator for the total quantity of candies that have been extracted.

	// Implement a preliminary check for sufficient input lines to avoid errors.
	if (dataLines.length < 2) {
		console.error("Input data error: Not enough lines provided for container configuration and candy contents.");
		return; // Terminate execution if input is malformed.
	}

	// Parse the first line to extract the number of containers and their maximum combined capacity.
	const configElements = dataLines[0].split(' ');
	const numberOfContainers = parseInt(configElements[0], 10);
	const maximumPairCapacity = parseInt(configElements[1], 10);

	// Parse the second line to get the initial candy counts for each container.
	// Robustly convert each string element to an integer, handling potential non-numeric entries.
	let containerCandyCounts = dataLines[1].split(' ').map((candyUnitString) => parseInt(candyUnitString, 10));

	// Further validation to ensure all critical numeric data was parsed successfully.
	if (isNaN(numberOfContainers) || isNaN(maximumPairCapacity) || containerCandyCounts.some(Number.isNaN)) {
		console.error("Data parsing error: One or more numeric values in the input were invalid.");
		return;
	}

	/**
	 * Adjusts the candy counts in a pair of adjacent containers by removing an excess quantity.
	 * The removal prioritizes the second container in the pair, then the first if excess remains.
	 * @param {number[]} pairIndexes - An array containing the indices [firstContainerIndex, secondContainerIndex] of the containers.
	 * @param {number} quantityToDeduct - The total amount of candy to remove from the pair.
	 */
	function removeExcessFromPair(pairIndexes, quantityToDeduct) {
		// If there's no excess to deduct, exit early.
		if (quantityToDeduct <= 0) {
			return;
		}

		const secondContainerIndex = pairIndexes[1];
		const firstContainerIndex = pairIndexes[0];

		// Calculate how much can be removed from the second container, limited by its current contents or the total excess.
		const amountFromSecond = Math.min(quantityToDeduct, containerCandyCounts[secondContainerIndex]);

		totalCandiesRemoved += amountFromSecond;
		containerCandyCounts[secondContainerIndex] -= amountFromSecond;
		quantityToDeduct -= amountFromSecond; // Update remaining excess.

		// If some excess still needs to be removed after depleting the second container.
		if (quantityToDeduct > 0) {
			totalCandiesRemoved += quantityToDeduct;
			containerCandyCounts[firstContainerIndex] -= quantityToDeduct;
		}
	}

	/**
	 * Computes the combined candy count of two specified containers.
	 * @param {number[]} pairIndexes - An array containing the indices [firstContainerIndex, secondContainerIndex] of the containers.
	 * @returns {number} The sum of candies in the two containers.
	 */
	function calculateCombinedCandySum(pairIndexes) {
		const firstIdx = pairIndexes[0];
		const secondIdx = pairIndexes[1];

		// Include a defensive check for out-of-bounds access, although the main loop should prevent this.
		if (firstIdx < 0 || secondIdx >= containerCandyCounts.length || firstIdx >= secondIdx) {
			console.warn(`Attempted to sum candies from invalid container indices: [${firstIdx}, ${secondIdx}].`);
			return 0; // Return zero if indices are invalid.
		}
		return containerCandyCounts[firstIdx] + containerCandyCounts[secondIdx];
	}

	/**
	 * Iterates through all adjacent container pairs, checking if their combined candy count
	 * exceeds the maximum allowed capacity and initiating removal if necessary.
	 */
	function conductContainerAudit() {
		// Ensure there are at least two containers to form a valid pair for auditing.
		if (containerCandyCounts.length < 2) {
			console.log("No adjacent container pairs are available for auditing.");
			return;
		}

		// Pre-calculate the upper bound for the loop to optimize performance.
		const limitForPairing = containerCandyCounts.length - 1;

		// Traverse through the containers, considering each adjacent pair.
		for (let currentContainerIdx = 0; currentContainerIdx < limitForPairing; ++currentContainerIdx) {
			const adjacentPair = [currentContainerIdx, currentContainerIdx + 1];
			const currentPairTotal = calculateCombinedCandySum(adjacentPair);
			const quantityOverCapacity = currentPairTotal - maximumPairCapacity;

			// If the combined candy count of the pair exceeds the limit, trigger the removal process.
			if (quantityOverCapacity > 0) {
				removeExcessFromPair(adjacentPair, quantityOverCapacity);
			}
		}
	}

	// Initiate the main auditing process for all candy containers.
	conductContainerAudit();

	// Display the final count of all candies that were removed during the process.
	console.log(totalCandiesRemoved);
}
// This section handles standard input/output operations. It should not be modified.
ProcessCandyDistribution(require("fs").readFileSync("/dev/stdin", "utf8"));