// This function handles the primary processing of incoming data.
function ProcessInput(rawData) {

	// Split the entire raw data by newline characters to get individual lines of text.
	var textLines = rawData.split("\n");

	// Take the very first line from the input for further analysis.
	var initialString = textLines[0];


	// This internal utility function recursively determines lengths of consecutive identical characters within a string.
	var calculateSegmentLengths = function(currentSegment, segmentLengths) {

		// Iterate through the current string segment to identify the first character that differs from the segment's start.
		segmentScan: for (var charIndex = 0; charIndex < currentSegment.length; charIndex++) {

			// If the character at the current index is different from the segment's starting character,
			if (currentSegment[charIndex] !== currentSegment[0]) {
				// Slice the string, keeping only the remaining part after this identified run of identical characters.
				currentSegment = currentSegment.slice(charIndex);
				// Store the length of this identified run (the `charIndex` itself represents the length).
				segmentLengths.push(charIndex);
				// Break out of the loop as a complete segment has been found and processed.
				break segmentScan;
			}
			// If we've reached the very end of the segment and all characters up to this point were identical,
			else if (charIndex === currentSegment.length - 1) {
				// Mark the current segment as fully processed by clearing it.
				currentSegment = "";
				// Store the total length of this final run (which is `charIndex + 1` for a 0-indexed loop).
				segmentLengths.push(charIndex + 1);
				// Break out of the loop.
				break segmentScan;
			}
		}

		// If there's still a part of the string left to process (i.e., `currentSegment` is not empty),
		if (currentSegment) {
			// Recursively call this function with the remaining segment to continue finding lengths.
			return calculateSegmentLengths(currentSegment, segmentLengths);
		}
		// Otherwise, if the string is empty, all segments have been processed and their lengths recorded.
		else {
			// Return the array containing all determined segment lengths.
			return segmentLengths;
		}
	};

	// Initialize the variable that will hold the ultimate computed value.
	var finalResult = 0;

	// Obtain a list of lengths for all consecutive character segments present in the initial string.
	var segmentGroups = calculateSegmentLengths(initialString, []);

	// Check for a specific condition: if exactly two segments were found.
	if (segmentGroups.length === 2) {
		// In this particular case, the result is simply the larger of the two segment lengths.
		if (segmentGroups[0] >= segmentGroups[1]) {
			finalResult = segmentGroups[0];
		} else {
			finalResult = segmentGroups[1];
		}
	}
	// For all other scenarios (e.g., one segment, or three or more segments).
	else {
		// Initialize the result with the sum of the first two segments in the list.
		finalResult = segmentGroups[0] + segmentGroups[1];

		// Iterate through the array of segment lengths, examining adjacent pairs.
		for (var groupIndex = 0; groupIndex < segmentGroups.length - 1; groupIndex++) {
			// If the sum of the current adjacent pair of segments is less than or equal to the current 'finalResult',
			// update 'finalResult' to this new, smaller sum. This effectively finds the minimum sum of any two adjacent segments.
			if (finalResult >= segmentGroups[groupIndex] + segmentGroups[groupIndex+1]) {
				finalResult = segmentGroups[groupIndex] + segmentGroups[groupIndex+1];
			}
		}
	}

	// Output the final computed result to the console.
	console.log(finalResult);
}

// Do not modify the following lines; they handle standard input/output and invoke the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));