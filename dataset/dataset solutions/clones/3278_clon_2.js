function ProcessData(rawText) {
	// Split the incoming text by newline characters and convert each part to a numerical value.
	let parsedNumbers = rawText.split("\n").map(Number);

	// Calculate the result based on specific array elements and print it to the console.
	console.log((parsedNumbers[0] + 1 - parsedNumbers[1]) * (parsedNumbers[0] + 1 - parsedNumbers[2]));
}

// Read data from standard input, remove leading/trailing whitespace, and pass it to the processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
