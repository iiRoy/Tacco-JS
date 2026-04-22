function ProcessData(sourceString)
{
	// Calculate the length of the central portion of the incoming sequence.
	let middleSegmentLength = sourceString.length - 2;

	// Extract the very first character from the provided textual data.
	const firstCharacter = sourceString.substr(0, 1);

	// Retrieve the concluding character from the supplied text.
	let lastCharacter = sourceString.substr(sourceString.length - 1, 1);

	// Formulate the ultimate output string by combining the extracted parts.
	const finalResult = firstCharacter + middleSegmentLength + lastCharacter;

	// Display the generated string to the user via the console.
	console.log(finalResult);
}

// Initiate the data processing workflow by reading input from the standard stream.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));