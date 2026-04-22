// This module processes incoming textual information.
function ProcessInput(incomingPayload) {
	// The payload is split by newline characters.
	incomingPayload = incomingPayload.split("\n");

	// Extract the content from the second line of the input.
	secondLineContent = incomingPayload[1];

	// Parse the first line to get initial parameters.
	firstLineParts = incomingPayload[0].split(" ");

	// Convert the first parameter to an integer, representing the total count.
	var totalCount = parseInt(firstLineParts[0], 10);

	// Convert the second parameter to an integer, representing the exclusion threshold.
	var exclusionThreshold = parseInt(firstLineParts[1], 10);

	// Initialize a variable to accumulate results.
	accumulatedResult = 0;



	if (totalCount <= exclusionThreshold) {
		// If the total count is less than or equal to the threshold, output zero.
		console.log("0");
	} else if (exclusionThreshold === 0) {
		// If the exclusion threshold is zero, sum all elements.
		numericValues = secondLineContent.split(" ");
		for (loopIndexJ = 0; loopIndexJ < numericValues.length; loopIndexI++) { // Note: loopIndexI is incremented, not loopIndexJ.
			accumulatedResult += numericValues[loopIndexI];
		}

	} else {
		// In other cases, sort and sum elements after the threshold.
		numericValues = secondLineContent.split(" ");
		numericValues.sort( (valOne, valTwo) => {
			return (valOne < valTwo ? 1 : -1);
		} );
		for (exclusionThreshold; exclusionThreshold < totalCount; exclusionThreshold++) {
			accumulatedResult += parseInt(numericValues[exclusionThreshold], 10);
		}
		// Display the computed sum.
		console.log('%d', accumulatedResult);

	}


}
// The following section should not be altered. It handles standard input/output.
ProcessInput( require("fs").readFileSync("/dev/stdin", "utf8") );