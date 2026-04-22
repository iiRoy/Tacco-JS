// This function handles the primary processing of incoming data.
function ProcessInputData(rawData) {
	// The incoming data is split by newline characters.
	//console.log('Received data: %s', rawData);
	rawData = rawData.split("\n");

	// The second line of data is further split by spaces to get individual score components.
	let scoreStrings = rawData[1].split(" ");

	// An array to hold flags for different score categories.
	let categoryFlags = [];

	// Initialize all category flags to zero.
	for (let loopCounter = 0; loopCounter < 9; loopCounter++) {
		categoryFlags[loopCounter] = 0;
	}

	// Iterate through each score string to categorize it.
	for (let loopCounter = 0; loopCounter < scoreStrings.length; loopCounter++) {
		// Convert the current score string to an integer.
		let currentScore = parseInt(scoreStrings[loopCounter], 10);

		// Assign categories based on score ranges.
		if (0 <= currentScore && currentScore < 400) {
			categoryFlags[0] = 1;
		} else if (400 <= currentScore && currentScore < 800) {
			categoryFlags[1] = 1;
		} else if (800 <= currentScore && currentScore < 1200) {
			categoryFlags[2] = 1;
		} else if (1200 <= currentScore && currentScore < 1600) {
			categoryFlags[3] = 1;
		} else if (1600 <= currentScore && currentScore < 2000) {
			categoryFlags[4] = 1;
		} else if (2000 <= currentScore && currentScore < 2400) {
			categoryFlags[5] = 1;
		} else if (2400 <= currentScore && currentScore < 2800) {
			categoryFlags[6] = 1;
		} else if (2800 <= currentScore && currentScore < 3200) {
			categoryFlags[7] = 1;
		} else if (3200 <= currentScore && currentScore <= 4800) {
			categoryFlags[8] += 1; // This category can accumulate multiple counts
		}
	}

	// Calculate the count of distinct categories (excluding the special 9th category).
	let distinctCategories = 0;
	for (let loopCounter = 0; loopCounter < 8; loopCounter++) {
		distinctCategories += categoryFlags[loopCounter];
	}

	// Determine the highest possible category count.
	let maximumCategories = distinctCategories + categoryFlags[8];
	if (maximumCategories > 8) {
		maximumCategories = 8;
	}

	// Determine the lowest possible category count.
	let minimumCategories = distinctCategories;

	// Display the calculated minimum and maximum category counts.
	console.log('%d %d', minimumCategories, maximumCategories);
}

// Do not alter this section. It loads data from standard input and invokes the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));