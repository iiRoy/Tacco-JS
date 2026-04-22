function ProcessInputData(incomingContent) {
	// Divide the complete input stream into distinct textual rows.
	let parsedLines = incomingContent.split("\n");

	// Designate the initial row as the primary working string.
	let currentTextBuffer = parsedLines[0];

	// Discard the first entry since it's already in use.
	parsedLines.shift();

	// Establish a numeric factor for string modification; 1 for normal, -1 for inversion.
	let orientationFlag = 1;

	// Traverse through each subsequent line, interpreting it as an operation.
	for (let lineIterator = 0; lineIterator < parsedLines.length; lineIterator++) {

		// Deconstruct the current operation line into its constituent segments.
		const instructionSegments = parsedLines[lineIterator].split(" ");

		// Evaluate the initial segment to determine the operation's nature.
		if (instructionSegments[0] == 1) {
			// If the first segment is '1', reverse the string modification factor.
			orientationFlag *= -1;
		} else {
			// Otherwise, execute a string manipulation based on the second segment.
			switch (instructionSegments[1] - 0) { // Coerce the second segment to a numerical type.
				case 1:
					// Operation type 1: Append or prepend the third segment based on 'orientationFlag'.
					switch (orientationFlag) {
						case 1:
							// Normal orientation: Append the third segment to the text buffer.
							currentTextBuffer += instructionSegments[2];
							break;
						case -1:
							// Inverted orientation: Prepend the third segment to the text buffer, and update the segment itself.
							currentTextBuffer = (instructionSegments[2] = instructionSegments[2] + currentTextBuffer);
							break;
					}
					break;
				case 2:
					// Operation type 2: Append or prepend, with logic opposite to type 1.
					switch (orientationFlag) {
						case -1:
							// Inverted orientation: Append the third segment to the text buffer.
							currentTextBuffer += instructionSegments[2];
							break;
						case 1:
							// Normal orientation: Prepend the third segment to the text buffer, and update the segment itself.
							currentTextBuffer = (instructionSegments[2] = instructionSegments[2] + currentTextBuffer);
							break;
					}
					break;
			}
		}
	}

	// Post-processing: Determine final output based on the 'orientationFlag'.
	if (orientationFlag == -1) {
		// If the flag is -1, output the string as it is.
		console.log(currentTextBuffer);
	} else {
		// If the flag is 1, reverse the string before outputting.
		console.log(currentTextBuffer.split("").reverse().join(""));
	}
}

// Initiate the primary processing routine using data from standard input.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());