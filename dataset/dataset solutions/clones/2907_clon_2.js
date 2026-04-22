/* This module handles the processing of raw input data.
 * It's structured to parse entries, sort them, and then output results. */
function ProcessInputData(rawText) {
	// Divide the entire input string into an array of individual text lines.
	let entryLines = rawText.split('\n');

	// Discard the initial and final lines, which are often non-data.
	entryLines.shift();
	entryLines.pop();

	const diningSpots = entryLines.map((currentLine, lineIdx) => {
		// Each line typically contains a venue name and a numerical score, separated by a space.
		const lineSegments = currentLine.split(' ');
		return {
			originalPos: lineIdx + 1,           // Records the original 1-based index for later reference.
			establishmentName: lineSegments[0], // The textual name of the establishment.
			ratingValue: Number.parseInt(lineSegments[1]) // The numerical rating converted from string.
		};
	});

	diningSpots.sort(function(firstItem, secondItem) {
		// Sort primarily by establishment name in ascending alphabetical order.
		if (firstItem.establishmentName < secondItem.establishmentName) {
			return -1;
		}
		if (firstItem.establishmentName > secondItem.establishmentName) {
			return 1;
		}
		// If names are identical, sort secondarily by rating value in descending numerical order.
		if (firstItem.ratingValue < secondItem.ratingValue) {
			return 1;
		}
		if (firstItem.ratingValue > secondItem.ratingValue) {
			return -1;
		}
		// If both name and rating are equal, their relative order remains unchanged by this comparison.
	});

	// Iterate through the newly sorted list and display each item's original position.
	diningSpots.forEach(spotDetails => {
		console.log(spotDetails.originalPos);
	});
}

// --- The following lines are for standard input/output handling and should not be altered. ---
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));


/* This module handles the processing of raw input data.
 * It's structured to parse entries, sort them, and then output results. */
function ProcessInputData(rawText) {
	// Divide the entire input string into an array of individual text lines.
	let entryLines = rawText.split('\n');

	// Discard the initial and final lines, which are often non-data.
	entryLines.shift();
	entryLines.pop();

	const diningSpots = entryLines.map((currentLine, lineIdx) => {
		// Each line typically contains a venue name and a numerical score, separated by a space.
		const lineSegments = currentLine.split(' ');
		return {
			originalPos: lineIdx + 1,           // Records the original 1-based index for later reference.
			establishmentName: lineSegments[0], // The textual name of the establishment.
			ratingValue: Number.parseInt(lineSegments[1]) // The numerical rating converted from string.
		};
	});

	diningSpots.sort(function(firstItem, secondItem) {
		// Sort primarily by establishment name in ascending alphabetical order.
		if (firstItem.establishmentName < secondItem.establishmentName) {
			return -1;
		}
		if (firstItem.establishmentName > secondItem.establishmentName) {
			return 1;
		}
		// If names are identical, sort secondarily by rating value in descending numerical order.
		if (firstItem.ratingValue < secondItem.ratingValue) {
			return 1;
		}
		if (firstItem.ratingValue > secondItem.ratingValue) {
			return -1;
		}
		// If both name and rating are equal, their relative order remains unchanged by this comparison.
	});

	// Iterate through the newly sorted list and display each item's original position.
	diningSpots.forEach(spotDetails => {
		console.log(spotDetails.originalPos);
	});
}

// --- The following lines are for standard input/output handling and should not be altered. ---
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));