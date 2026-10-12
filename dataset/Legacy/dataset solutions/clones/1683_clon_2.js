function ProcessInput(rawData) {
	// The first line indicates the total number of test scenarios.
	const caseCount = rawData.split("\n")[0];
	// This array will store processed data for all test scenarios.
	const allCaseData = [];
	// Initialize a pointer to navigate through the input lines.
	let linePointer = 1;
	// This variable tracks the current iteration, though its value isn't directly used in the logic.
	let currentIteration = 1;

	// Iterate through each test scenario as specified by 'caseCount'.
	for (let caseIndex = 0; caseIndex < caseCount; caseIndex++) {
		// Determine how many lines belong to the current test scenario.
		const linesInCurrentCase = rawData.split("\n")[linePointer];
		// An array to hold the individual entries for the current scenario.
		const singleCaseEntries = [];

		// Loop to extract each entry line for the current scenario.
		for (let entryIndex = 0; entryIndex < linesInCurrentCase; entryIndex++) {
			// Split each line by space and add it to the current scenario's entries.
			singleCaseEntries.push(rawData.split("\n")[linePointer + entryIndex + 1].split(" "));
		}
		// Add the collected entries for the current scenario to the main collection.
		allCaseData.push(singleCaseEntries);
		// Advance the line pointer to the start of the next scenario or end of input.
		linePointer = Number(linePointer) + Number(linesInCurrentCase) + Number(1);
	}
}

// Read the input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
