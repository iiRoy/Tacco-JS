run (function * (emitOutput, fetchInput) {
	// Initialize counters for two types of blocks.
	// Values are read from standard input, adjusted by subtracting one.
	let whtCount = +(yield) - 1;
	let blkCount = +(yield) - 1;

	// This array will store all the generated output lines.
	const outputRows = [];

	// --- First generation phase: Process 'white' blocks ---
	// This loop continues as long as there are 'white' blocks remaining to be placed.
	do {
		let firstRowSegment = ''; // Accumulator for the first line of a pair.
		let secondRowSegment = ''; // Accumulator for the second line of a pair.

		// Iterate to construct a 100-character wide segment for the current pair of lines.
		for (let idx = 0; idx < 100; idx += 2) {
			if (whtCount > 0) {
				// If 'white' blocks are available, use the specific pattern.
				firstRowSegment += '.' + '#';
				secondRowSegment += '#' + '#';
				--whtCount; // Decrement the counter for 'white' blocks.
			} else {
				// If no 'white' blocks are left, use the default '##' pattern.
				firstRowSegment += '#' + '#';
				secondRowSegment += '#' + '#';
			}
		}
		// Add the two generated line segments to our collection of output rows.
		outputRows.push(firstRowSegment, secondRowSegment);
	} while (whtCount > 0); // Continue if more 'white' blocks need to be processed.

	// --- Second generation phase: Process 'black' blocks ---
	// This loop continues as long as there are 'black' blocks remaining to be placed.
	do {
		let firstRowSegment = ''; // Accumulator for the first line of a pair.
		let secondRowSegment = ''; // Accumulator for the second line of a pair.

		// Iterate to construct a 100-character wide segment for the current pair of lines.
		for (let idx = 0; idx < 100; idx += 2) {
			if (blkCount > 0) {
				// If 'black' blocks are available, use their specific pattern.
				firstRowSegment += '.' + '.';
				secondRowSegment += '#' + '.';
				--blkCount; // Decrement the counter for 'black' blocks.
			} else {
				// If no 'black' blocks are left, use the default '..' pattern.
				firstRowSegment += '.' + '.';
				secondRowSegment += '.' + '.';
			}
		}
		// Add the two generated line segments to our collection of output rows.
		outputRows.push(firstRowSegment, secondRowSegment);
	} while (blkCount > 0); // Continue if more 'black' blocks need to be processed.

	// Output the dimensions of the generated grid (number of rows and fixed width).
	emitOutput(`${outputRows.length} 100`);

	// Iterate through the collected output rows and print each one.
	for (let idx = 0; idx < outputRows.length; ++idx) {
		emitOutput(outputRows[idx]);
	}
});

/**
 * This function serves as a custom runtime environment for a generator-based main routine.
 * It manages standard input (stdin) and standard output (stdout) operations.
 * @param {(emitOutput: (textLine: string, lineEnd?: string) => void, fetchInput: () => IterableIterator<string|null>) => IterableIterator<any>} primaryRoutine The main generator function that contains the application logic.
 */
function run (primaryRoutine) {
	const inputSource = process.stdin; // Reference to the standard input stream.
	const outputSink = process.stdout; // Reference to the standard output stream.

	/**
	 * Buffer for parsed input tokens (either full lines or individual words).
	 * @type {[string|null]}
	 */
	const tokenBuffer = [];
	/**
	 * Buffer for raw input lines read from the stream.
	 * @type {[string]}
	 */
	const lineBuffer = [];
	let remainingInput = ''; // Stores any partial line data from input chunks.
	let inputFinished = false; // Flag indicating if the input stream has signaled its end.

	// Constants defining the two modes for reading input.
	const LINE_READ_MODE = 0;
	const WORD_READ_MODE = 1;
	let currentReadMode = WORD_READ_MODE; // The initial mode for input parsing.

	/**
	 * Writes a given string to the standard output stream.
	 * Appends a platform-specific newline character by default, or a specified `lineEnd`.
	 * @param {string} textLine The string content to be written.
	 * @param {string} [lineEnd] An optional string to use as a line terminator.
	 */
	function emitOutput (textLine, lineEnd) {
		outputSink.write(textLine + (void 0 === lineEnd ? os.EOL : lineEnd));
	}

	/**
	 * A generator function that provides input to the `primaryRoutine`.
	 * It can yield control back to the runtime if a full line is requested but not available.
	 * @returns {IterableIterator<string|null>} An iterator that yields input data.
	 */
	function *fetchInput () {
		if (lineBuffer.length > 0) {
			// If there are lines already buffered, return the first one immediately.
			return lineBuffer.shift();
		} else {
			// If no lines are buffered, switch to line-read mode and wait for input.
			currentReadMode = LINE_READ_MODE;
			/**
			 * @type {string}
			 */
			const receivedLine = yield; // Pause execution until a line is provided by the runtime.
			currentReadMode = WORD_READ_MODE; // After receiving, revert to word-read mode.
			return receivedLine;
		}
	}

	// Initialize the iterator for the main application routine.
	const routineIterator = primaryRoutine(emitOutput, fetchInput);

	/**
	 * Processes a chunk of data received from the standard input stream.
	 * This function is called by the 'data' event listener or when the stream ends.
	 * @param {string|null} dataChunk The received data, or `null` if the stream has ended.
	 */
	function processDataChunk (dataChunk) {
		inputSource.pause(); // Temporarily pause the input stream to prevent further 'data' events.

		if (null === dataChunk) {
			// If `dataChunk` is null, it signifies the end of the input stream.
			lineBuffer.push(null);
		} else {
			// Append the new data chunk to any previously remaining input.
			remainingInput += dataChunk;
			// Regular expression to find complete lines, including various newline characters.
			const lineRegex = /.*(\r?\n|\r)/g;
			let lineMatchResult;
			let lastMatchPosition = 0;

			// Extract all complete lines from the accumulated input.
			while (null !== (lineMatchResult = lineRegex.exec(remainingInput))) {
				lastMatchPosition = lineRegex.lastIndex;
				lineBuffer.push(lineMatchResult[0]); // Add the full matched line to the line buffer.
			}
			// Keep any partial line that did not end with a newline.
			remainingInput = remainingInput.substring(lastMatchPosition);
		}
		processInputLoop(); // Continue processing the buffered input.
	}

	/**
	 * The core loop for processing buffered input and feeding it to the `primaryRoutine`.
	 * It handles switching between line and word parsing modes.
	 */
	function processInputLoop () {
		// Continue processing as long as there are lines in the buffer.
		while (lineBuffer.length > 0) {
			switch (currentReadMode) {
				case LINE_READ_MODE:
				{
					// If in line-read mode, simply move the next line to the token buffer.
					tokenBuffer.push(lineBuffer.shift());
				}
				break;
				case WORD_READ_MODE:
				{
					// If in word-read mode.
					if (null === lineBuffer[0]) {
						// If the current line is null (end of input), push it as a token.
						tokenBuffer.push(lineBuffer.shift());
					} else {
						// Otherwise, extract words from the current line.
						const wordRegex = /[^\s]+/g; // Regex to match sequences of non-whitespace characters.
						let lineMatchResult;
						if (null !== (lineMatchResult = wordRegex.exec(lineBuffer[0]))) {
							// If a word is found, add it to the token buffer.
							tokenBuffer.push(lineMatchResult[0]);
							// Remove the extracted word from the current line in the buffer.
							lineBuffer[0] = lineBuffer[0].substring(wordRegex.lastIndex);
						} else {
							// If no words are left on the current line, discard it.
							lineBuffer.shift();
						}
					}
				}
				break;
			}

			// Process all available tokens in the token buffer.
			while (tokenBuffer.length > 0) {
				// Advance the main routine's iterator with the next token.
				const iteratorResult = routineIterator.next(tokenBuffer.shift());

				// If the iterator yielded a value, output it.
				if (void 0 !== iteratorResult.value) {
					if (typeof '' === typeof iteratorResult.value) { // Check if the yielded value is a string.
						emitOutput(iteratorResult.value, ''); // Output the string directly.
					} else {
						emitOutput(`${iteratorResult.value}`, ''); // Convert to string and output.
					}
				}
				// If the main routine has completed, exit this function.
				if (iteratorResult.done) return;
			}
		}

		// If input processing is not yet finished, resume the input stream to get more data.
		// Otherwise, schedule a final call to `processDataChunk` with `null` to ensure EOF is handled.
		inputFinished ? setTimeout(processDataChunk, 0, null) : inputSource.resume();
	}

	// Set up event listeners for the standard input stream.
	inputSource.on('data', processDataChunk); // Call `processDataChunk` when new data arrives.
	inputSource.on('end', function () {
		inputFinished = true; // Mark that the input stream has ended.
		processDataChunk(null); // Process any remaining data and signal the end.
	});

	// Set the character encoding for the input stream.
	inputSource.setEncoding('utf8');
	// Make an initial call to `processDataChunk` with `null` to kickstart the process,
	// especially if there's no immediate input or to handle an empty input scenario.
	processDataChunk(null);
}

// Import the 'os' module to access platform-specific end-of-line characters.
const os = require('os');
