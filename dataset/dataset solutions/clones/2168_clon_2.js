function ProcessInput(rawData) {
	// Split the incoming data into an array of individual lines
	let linesArray = rawData.split("\n");

	// Extract the first line and split it by space to get tokens
	let firstLineTokens = linesArray[0].split(" ");

	// Extract the second line and split it by space to get number strings
	let numberStrings = linesArray[1].split(" ");

	// Convert the first number string to an integer
	numberStrings[0] = parseInt(numberStrings[0]);

	// Convert the second number string to an integer
	numberStrings[1] = parseInt(numberStrings[1]);

	// Check if the first token from the first line matches the third line content
	if (firstLineTokens[0] === linesArray[2])
		// If they match, decrement the first integer
		numberStrings[0]--;
	else
		// Otherwise, decrement the second integer
		numberStrings[1]--;

	// Output the modified integers separated by a space
	console.log(numberStrings[0] + " " + numberStrings[1]);
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));