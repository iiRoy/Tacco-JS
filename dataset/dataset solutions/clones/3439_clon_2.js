function ComputeResult(incomingData) {
	incomingData = incomingData.split("\n"); // Separate raw input into individual lines.

	const totalEntries = parseInt(incomingData[0], 10); // Extract and parse the count of items from the first line.

	let dataPoints = incomingData[1].split(" ").map(currentNum => parseInt(currentNum, 10)); // Process the second line into an array of numeric values.

	let runningTotal = 0.0; // Initialize a variable to hold the cumulative sum.

	for (let loopIndex = 0; loopIndex < totalEntries; ++loopIndex) {
		runningTotal += dataPoints[loopIndex]; // Accumulate the sum of all data points.
	}

	for (let loopIndex = 0; loopIndex < totalEntries; ++loopIndex) {
		const averageValue = runningTotal / totalEntries; // Calculate the arithmetic mean.
		dataPoints[loopIndex] = {
			deviation: Math.abs(dataPoints[loopIndex] - averageValue), // Compute the absolute deviation from the average.
			initialIndex: loopIndex // Store the original position of the element.
		};
	}

	dataPoints = dataPoints.sort((elemA, elemB) => elemA.deviation - elemB.deviation); // Sort the processed items based on their deviation values.

	return dataPoints[0].initialIndex; // Return the original index of the item with the smallest deviation.
}

// This section handles environment-specific execution, primarily for testing or demonstration purposes.
((inputContent, executionOutput, outputType) =>
	typeof require !== "undefined"
		? console.log(ComputeResult(require("fs").readFileSync("/dev/stdin", "utf8")))
		: [
			inputContent = inputContent.split("\n").slice(1, -1).join("\n"), // Prepare input for browser context.
			executionOutput = (() => { // Execute the main function within a try-catch block.
				try {
					return ComputeResult(inputContent);
				} catch (errDetails) {
					return errDetails.stack || errDetails.message; // Capture error information.
				}
			})(),
			outputType = typeof executionOutput, // Determine the type of the execution result.
			outputType === "string" || (executionOutput = JSON.stringify(executionOutput)), // Convert non-string results to JSON.
			$("<form>")
				.append(
					[[10, inputContent], 0, [1, outputType], 0, [10, executionOutput]]
						.map(configData => // Map configuration data to DOM elements.
							configData
								? $("<textarea>", { rows: configData[0], cols: 40, text: configData[1] }) // Create textarea for valid config.
								: $("<br>") // Create line break.
						)
				)
				.appendTo("body") // Append the form to the document body.
		]
)(`
5
2 5 2 5 6
`);