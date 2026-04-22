initiateProcess (function * (emitOutput, fetchInput) {
	// Initialize the first counter for pattern generation.
	var firstCounter = +(yield) - 1;
	// Initialize the second counter, also from yielded input.
	var secondCounter = +(yield) - 1;

	// Output an initial informational line, calculating a value based on counters.
	emitOutput(`${Math.floor((firstCounter - 1) / 50) * 2 + 2 + Math.floor((secondCounter - 1) / 50) * 2 + 2} 100`);

	// Begin the first pattern generation block.
	do {
		let currentLineA = "", currentLineB = ""; // Buffers for two lines of the pattern.
		for (let loopIndex = 0; loopIndex < 100; loopIndex += 2) {
			if (0 < firstCounter) {
				currentLineA += ".#";
				currentLineB += "##";
				--firstCounter; // Decrement the first counter.
			} else {
				currentLineA += "##";
				currentLineB += "##";
			}
		}
		emitOutput(currentLineA); // Send out the first generated line.
		emitOutput(currentLineB); // Send out the second generated line.
	} while (0 < firstCounter); // Continue while the first counter is positive.
	
	// Begin the second pattern generation block.
	do {
		let currentLineA = "", currentLineB = ""; // Re-initialize line buffers for the next pattern.
		for (let loopIndex = 0; loopIndex < 100; loopIndex += 2) {
			if (0 < secondCounter) {
				currentLineA += "..";
				currentLineB += "#.";
				--secondCounter; // Decrement the second counter.
			} else {
				currentLineA += "..";
				currentLineB += "..";
			}
		}
		emitOutput(currentLineA); // Output the first line of the second pattern.
		emitOutput(currentLineB); // Output the second line of the second pattern.
	} while (0 < secondCounter); // Continue while the second counter is positive.
});

/**
 * Orchestrates the execution of a generator-based application, managing standard I/O.
 * @param {(outputFunc: (textPayload: string, endDelimiter?: string) => void, inputFunc: () => Generator<string|null>) => Generator<any>} applicationEntry The primary generator function for the application logic.
 */
function initiateProcess (applicationEntry) {
	const inputChannel = process.stdin; // Reference to standard input stream.
	const outputChannel = process.stdout; // Reference to standard output stream.

	/**
	 * @type {(string | null)[]} An array to buffer parsed tokens or lines for the generator.
	 */
	const parsedTokens = [];
	/**
	 * @type {string[]} An array to buffer incoming raw lines from the stream.
	 */
	const bufferedLines = [];
	let unprocessedFragment = ""; // Holds partial data not yet forming a complete line.
	let processingCompleted = false; // Flag indicating the input stream has finished.

	const MODE_LINE_BY_LINE = 0; // Constant for input mode: consume an entire line.
	const MODE_TOKEN_BY_TOKEN = 1; // Constant for input mode: consume a single word/token.
	let currentParsingMode = MODE_TOKEN_BY_TOKEN; // The current strategy for reading input.

	/**
	 * Writes content to the standard output stream.
	 * @param {string} textPayload The string data to be written.
	 * @param {string} [endDelimiter] Optional string to use as a line terminator; defaults to system EOL.
	 */
	function transmitOutput (textPayload, endDelimiter) {
		outputChannel.write(textPayload + (undefined === endDelimiter ? systemUtilities.EOL : endDelimiter));
	}
	
	/**
	 * A generator function to provide input to the main application generator.
	 * It prioritizes buffered lines, otherwise yields to request more data.
	 * @returns {Generator<string|null>} A generator that yields a single input item.
	 */
	function *acquireInput () {
		if (0 < bufferedLines.length) {
			return bufferedLines.shift(); // Retrieve an item from the buffer.
		} else {
			currentParsingMode = MODE_LINE_BY_LINE; // Switch mode to await a full line.
			/**
			 * @type {string}
			 */
			const inputRecord = yield; // Pause execution and wait for an input value.
			currentParsingMode = MODE_TOKEN_BY_TOKEN; // Revert to token parsing mode.
			return inputRecord;
		}
	}

	// Instantiate the main application generator with the I/O functions.
	const coreGenerator = applicationEntry(transmitOutput, acquireInput);

	/**
	 * Callback for handling incoming data chunks from the input stream.
	 * @param {string | null} dataBlock The data received, or null if the stream has ended.
	 */
	function handleIncomingData (dataBlock) {
		inputChannel.pause(); // Temporarily halt the input stream to process.
		if (null === dataBlock) {
			bufferedLines.push(null); // Indicate end of stream in the buffer.
		} else {
			unprocessedFragment += dataBlock; // Append new data to the existing fragment.
			const lineExtractionRegex = /.*(\r?\n|\r)/g; // Regular expression to match complete lines.
			let extractedLineMatch, lastMatchPosition = 0;
			
			while (null !== (extractedLineMatch = lineExtractionRegex.exec(unprocessedFragment))) {
				lastMatchPosition = lineExtractionRegex.lastIndex;
				bufferedLines.push(extractedLineMatch[0]); // Add extracted line to the buffer.
			}
			unprocessedFragment = unprocessedFragment.substring(lastMatchPosition); // Retain any leftover partial data.
		}
		processDataCycle(); // Initiate or continue the main processing loop.
	}

	/**
	 * The central loop responsible for feeding input to the generator and handling its output.
	 */
	function processDataCycle () {
		while (0 < bufferedLines.length) {
			switch (currentParsingMode) {
				case MODE_LINE_BY_LINE:
				{
					parsedTokens.push(bufferedLines.shift()); // Consume an entire line as a single token.
				}
				break;
				case MODE_TOKEN_BY_TOKEN:
				{
					if (null === bufferedLines[0]) {
						parsedTokens.push(bufferedLines.shift()); // Propagate the end-of-stream marker.
					} else {
						const tokenExtractionRegex = /[^\s]+/g; // Regex to extract individual tokens.
						let extractedTokenMatch;
						if (null !== (extractedTokenMatch = tokenExtractionRegex.exec(bufferedLines[0]))) {
							parsedTokens.push(extractedTokenMatch[0]); // Add the found token to parsed list.
							bufferedLines[0] = bufferedLines[0].substring(tokenExtractionRegex.lastIndex); // Remove token from the current line.
						} else {
							bufferedLines.shift(); // If no tokens remain, discard the line.
						}
					}
				}
				break;
			}

			while (0 < parsedTokens.length) {
				const generatorResult = coreGenerator.next(parsedTokens.shift()); // Advance the generator with the next token.
				
				if (undefined !== generatorResult.value) {
					if ('string' === typeof generatorResult.value) {
						transmitOutput(generatorResult.value, ""); // Output string results directly.
					} else {
						transmitOutput(`${generatorResult.value}`, ""); // Convert and output other data types.
					}
				}
				if (generatorResult.done) return; // Terminate if the generator has completed its execution.
			}
		}

		// If all processing is done, schedule a final check; otherwise, resume input stream.
		processingCompleted ? setTimeout(handleIncomingData, 0, null) : inputChannel.resume();
	}
	
	// Register event handlers for data reception and stream termination.
	inputChannel.on('data', handleIncomingData);
	inputChannel.on('end', function () {
		processingCompleted = true; // Mark that the input stream has concluded.
		handleIncomingData(null); // Process the final end-of-stream event.
	});

	inputChannel.setEncoding('utf8'); // Ensure input is treated as UTF-8.
	handleIncomingData(null); // Kick off the initial data processing cycle.
}

// Import the 'os' module for system-specific utilities, e.g., end-of-line character.
const systemUtilities = require('os');