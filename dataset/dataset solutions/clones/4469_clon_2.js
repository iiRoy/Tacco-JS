// This module handles processing of numerical input strings.
function ProcessData(rawDataString) {
	// Split the entire payload into individual lines.
	let dataRows = rawDataString.split("\n");

	// Extract the first line and split it by spaces to get individual components.
	const firstRowElements = dataRows[0].split(" ");

	// Convert the first component to a numerical value.
	const firstNumber = Number(firstRowElements[0]);
	// Convert the second component to a numerical value.
	const secondNumber = Number(firstRowElements[1]);

	// Check a specific divisibility condition.
	// If the sum is not divisible by 3 AND the first number is not divisible by 3 AND the second number is not divisible by 3...
	if ( (firstNumber + secondNumber) % 3  &&  firstNumber % 3  &&  secondNumber % 3 ) {
		console.log("Outcome: Impossible"); // Display a negative result.
	}
	else {
		console.log("Outcome: Possible"); // Display an affirmative result.
	}
}

// Invoke the data processing function with content read from standard input.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));