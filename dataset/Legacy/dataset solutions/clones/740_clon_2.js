#!/usr/bin/node
// This script processes numerical input lines from standard input.
(function() {
	// Initialize an array to store processed lines and a variable for the input stream.
	var collectedLines = [], inputSource;

	// Open the standard input stream.
	inputSource = process.openStdin();
	// Set the character encoding for the input stream.
	inputSource.setEncoding('utf8');

	// A buffer to hold incomplete lines received from the input stream.
	var partialBuffer = '';

	// Attach an event listener for incoming data chunks.
	inputSource.on('data', function(incomingData) {
		// Concatenate the current buffer with new data and split by newline.
		// The last element might be an incomplete line, so it's stored back in the buffer.
		var processedChunks = (partialBuffer + incomingData).split("\n");
		partialBuffer = processedChunks.pop();

		// Iterate over the complete lines.
		for (var lineIndex = 0; lineIndex < processedChunks.length; lineIndex++) {
			// Skip any empty lines.
			if (processedChunks[lineIndex] === '') {
				continue;
			}
			// Add non-empty lines to our collection.
			collectedLines.push(processedChunks[lineIndex]);
		}
	});

	// Attach an event listener for the end of the input stream.
	inputSource.on('end', function(finalEvent) {
		// If there's any remaining data in the buffer after all 'data' events,
		// process it as a final line.
		if (partialBuffer) {
			// Add a newline to ensure the fragment is treated as a complete line for splitting.
			var processedChunks = (partialBuffer + "\n").split("\n");
			partialBuffer = processedChunks.pop(); // This will likely be empty now.

			for (var lineIndex = 0; lineIndex < processedChunks.length; lineIndex++) {
				if (processedChunks[lineIndex] === '') {
					continue;
				}
				collectedLines.push(processedChunks[lineIndex]);
			}
		}

		// Remove the last element from the collected lines.
		// This often corresponds to an empty line or EOF marker from the input.
		collectedLines.pop();

		// Process each collected line.
		for (var currentLineIdx = 0; currentLineIdx < collectedLines.length; currentLineIdx++) {
			// Split the line by spaces to get individual number strings.
			var parsedNumbers = collectedLines[currentLineIdx].split(" ");
			// Convert each string part to an integer.
			for (var numIndex = 0; numIndex < parsedNumbers.length; numIndex++) {
				parsedNumbers[numIndex] = parseInt(parsedNumbers[numIndex], 10);
			}

			// Assign the parsed integer values to descriptive variables.
			var totalItems = parsedNumbers[0];
			var stepSize = parsedNumbers[1];
			var offsetValue = parsedNumbers[2];

			// Initialize variables for the Josephus problem calculation.
			var currentPosition = 0, counter = 0;
			// Perform the Josephus calculation.
			// The loop runs from 1 up to (but not including) totalItems.
			for (; ++counter < totalItems; currentPosition %= counter) {
				currentPosition += stepSize;
			}
			// Output the final calculated position, adjusted by the offset and 1-based indexing.
			console.log((currentPosition + offsetValue) % totalItems + 1);
		}
	});
})();
