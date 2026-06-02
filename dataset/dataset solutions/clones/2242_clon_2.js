function ProcessInput(rawData) {
	// This function processes raw input data.
	// The initial string is cleaned, split by spaces, and each part converted to an integer.
	let parsedNumbers = rawData.trim().split(" ").map((numStr) => parseInt(numStr, 10));

	let countElements = parsedNumbers[0]; // First number represents the total count.
	let thresholdValue = parsedNumbers[1]; // Second number is a threshold.
	let initialValue = parsedNumbers[2]; // Third number is a starting value.

	let resultString = ""; // Accumulator for the output sequence.

	// Iterate from 1 up to the total count.
	for (let loopIndex = 1; loopIndex <= countElements; loopIndex++) {
		if (loopIndex <= thresholdValue) {
			// If the current index is within the threshold, append the initial value.
			resultString += initialValue + " ";
		} else {
			// Otherwise, apply a conditional modification to the initial value.
			if (initialValue === 1) {
				resultString += (initialValue + 1) + " "; // If initial value is 1, use 1+1.
			} else {
				resultString += (initialValue - 1) + " "; // Otherwise, use initial value - 1.
			}
		}
	}

	// Attempt to remove a trailing space, but this operation does not modify the string in place.
	resultString.replace(/ $/, '');

	// Display the final generated string to the console.
	console.log(resultString);
}

// The following lines handle standard input/output and should not be altered.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
