function ProcessInput(inputString) {
	// Initialize an array to store the processed segments.
	let outputSegments = [];

	// Begin the primary processing flow.
	ProcessSegmentA(inputString, 0, 1, outputSegments);

	// Display the total count of segments found.
	console.log('%d', outputSegments.length);
}

function ProcessSegmentA(inputString, currentIndex, segmentLength, outputSegments) {
	// This function handles the initial segmentation logic.
	// console.log("ProcessSegmentA: ", inputString, currentIndex, segmentLength, outputSegments);

	// If the current index has gone beyond the string's bounds, exit.
	if (currentIndex > inputString.length) {
		return;
	}

	// Extract a portion of the string based on the current position and desired length.
	const currentSegment = inputString.substr(currentIndex, segmentLength);

	// If the extracted segment is empty, there's nothing more to process here.
	if (currentSegment === '') {
		return;
	}

	// First, check for and handle any sequences of repeated characters.
	HandleRepeatedChars(inputString, currentIndex, outputSegments);

	// Update the current index to reflect the total length of segments already processed and joined.
	currentIndex = outputSegments.join("").length;

	// If the updated index now covers the entire input string, we are done.
	if (currentIndex >= inputString.length) {
		return;
	}

	// Extract two consecutive parts for comparison.
	const firstPart = inputString.substr(currentIndex, segmentLength);
	const nextPart = inputString.substr(currentIndex + segmentLength, 1);

	// Compare these two parts.
	if (firstPart === nextPart) {
		// If they are identical, extend the segment length and re-evaluate.
		return ProcessSegmentA(inputString, currentIndex, segmentLength + 1, outputSegments);
	} else {
		// If they differ, add both parts to the results and transition to the secondary processing stage.
		outputSegments.push(firstPart, nextPart);
		return ProcessSegmentB(inputString, currentIndex + segmentLength + 1, 1, nextPart, outputSegments);
	}
}

function ProcessSegmentB(inputString, currentIndex, segmentLength, previousSegment, outputSegments) {
	// This function handles subsequent segmentation after an initial difference is found.
	// console.log("ProcessSegmentB: ", currentIndex, outputSegments);

	// If the current index exceeds the string's length, terminate.
	if (currentIndex > inputString.length) {
		return;
	}

	// Get the current segment from the input string.
	const currentSegment = inputString.substr(currentIndex, segmentLength);

	// If the current segment is empty, exit.
	if (currentSegment === '') {
		return;
	}

	// Compare the previously identified segment with the current one.
	if (previousSegment === currentSegment) {
		// If they match, check if we are near the end of the string.
		if (currentIndex + segmentLength + 1 > inputString.length) {
			// Special handling for boundary condition: swap the last two elements in the output.
			const tempSegment = outputSegments[outputSegments.length - 2];
			outputSegments[outputSegments.length - 2] = previousSegment;
			outputSegments[outputSegments.length - 1] = tempSegment;
			// Recurse with an incremented segment length and the swapped segment.
			return ProcessSegmentB(inputString, currentIndex, segmentLength + 1, tempSegment, outputSegments);
		}
		// Standard recursion: increment segment length, keeping the previous segment.
		return ProcessSegmentB(inputString, currentIndex, segmentLength + 1, previousSegment, outputSegments);
	} else {
		// If segments do not match, add the current segment to the collection.
		outputSegments.push(currentSegment);
		// Recurse with an updated index, reset segment length to 1, and the current segment as the new previous.
		return ProcessSegmentB(inputString, currentIndex + segmentLength, 1, currentSegment, outputSegments);
	}
}

function HandleRepeatedChars(inputString, currentIndex, outputSegments) {
	// This function identifies and processes long sequences of identical characters.
	// console.log("HandleRepeatedChars: ", inputString, currentIndex, outputSegments);

	// Get the character at the starting position.
	const firstChar = inputString.substr(currentIndex, 1);

	// Construct a regular expression to find repetitions of this character.
	const regexPattern = new RegExp(firstChar + '*');

	// Find the longest sequence of the repeated character starting from the current index.
	const matchedPart = inputString.substr(currentIndex).match(regexPattern);

	// Determine the length of this matched sequence.
	const matchLength = matchedPart[0].length;

	// Only process if the repeated sequence is longer than 3 characters.
	if (matchLength > 3) {
		// Based on the length modulo 3, decide how to split the repeated part.
		if (matchLength % 3 === 2) {
			outputSegments = SplitRepeatedPart(matchedPart[0], 2, outputSegments);
		} else if (matchLength % 3 === 1) {
			outputSegments = SplitRepeatedPart(matchedPart[0], 1, outputSegments);
		} else {
			// If matchLength % 3 === 0, default to a split length of 2.
			outputSegments = SplitRepeatedPart(matchedPart[0], 2, outputSegments);
		}
	}
	// Return the (potentially modified) array of output segments.
	return outputSegments;
}

function SplitRepeatedPart(matchedPart, segmentLength, outputSegments) {
	// This recursive helper function splits a long repeated string into segments.
	// console.log("SplitRepeatedPart: ", matchedPart, segmentLength, outputSegments);

	// Extract the initial segment from the matched string.
	const firstSegment = matchedPart.substr(0, segmentLength);
	outputSegments.push(firstSegment); // Add this segment to the results.

	// If the remaining part of the string is too short, stop the recursion.
	if (matchedPart.length < 3) {
		return outputSegments;
	} else {
		// Extract the rest of the string after the first segment.
		const remainingPart = matchedPart.substr(segmentLength);
		// Recursively call with the remaining part and an adjusted segment length for the next split.
		return SplitRepeatedPart(remainingPart, 3 - segmentLength, outputSegments);
	}
}

// Execute the main processing function with input read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
