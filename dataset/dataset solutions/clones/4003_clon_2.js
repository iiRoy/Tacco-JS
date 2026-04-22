executeTask (function * (emitOutput, acquireInput) {
	/* Obtain the initial numeric value from the input stream */
	let inputNumber = Number.parseInt(yield, 0xA);
	// Send out the computed value, which is the floor division by three
	emitOutput(Math.floor(inputNumber / 0x3));
});

/*
 * This function serves as a general-purpose runner for generator-based main routines.
 * It manages standard input and output operations, parsing data into lines or words
 * as requested by the main routine.
 * @param {function(function(string, string?): void, function(): IterableIterator<string|null>): IterableIterator<any>} primaryRoutine - The main generator function to execute.
 */
function executeTask (primaryRoutine) {
	// Reference to the standard input stream
	const inputStream = process.stdin;
	// Reference to the standard output stream
	const outputStream = process.stdout;

	/**
	 * Buffer to hold processed tokens (words or lines) ready for the generator.
	 * @type {Array<string|null>}
	 */
	let tokenBuffer = [];
	/**
	 * Cache for raw input lines received from the stream.
	 * @type {Array<string>}
	 */
	let lineCache = [];
	let remainingData = ""; // Stores partial data chunks that don't form a complete line
	let streamConcluded = false; // Flag indicating if the input stream has ended

	const STATE_LINE_READ = 0x0; // Mode constant for reading entire lines
	const STATE_WORD_READ = 0x1; // Mode constant for reading individual words

	let currentParsingState = STATE_WORD_READ; // Initial parsing mode

	/**
	 * Writes a given string to the output stream, optionally with a custom terminator.
	 * @param {string} contentLine - The string to be written.
	 * @param {string} [terminatorChar] - Optional character(s) to append after the line. Defaults to OS EOL.
	 */
	function sendData (contentLine, terminatorChar) {
		outputStream.cork(); // Begin buffering output
		outputStream.write(contentLine + (void 0 === terminatorChar ? systemUtilities.EOL : terminatorChar)); // Write content plus terminator
		outputStream.uncork(); // Flush buffered output
	}
	
	/*
	 * Generator function to retrieve input tokens (either lines or words) for the main routine.
	 */
	function *fetchInputToken () {
		if (0x0 < lineCache.length) { // If there are cached lines, return one
			return lineCache.shift();
		} else {
			currentParsingState = STATE_LINE_READ; // Switch to line reading mode
			/**
			 * The line received from the yield expression.
			 * @type {string}
			 */
			let receivedLine = yield;
			currentParsingState = STATE_WORD_READ; // Revert to word reading mode
			return receivedLine;
		}
	}

	// Instantiate the main routine's generator with our I/O functions
	const routineIterator = primaryRoutine(sendData, fetchInputToken);

	/**
	 * Handles incoming data chunks from the input stream.
	 * @param {string|null} dataBlock - The received data chunk or null if stream ended.
	 */
	function processInputBlock (dataBlock) {
		inputStream.pause(); // Temporarily stop reading from the input stream

		if (null === dataBlock) { // If end-of-stream signal is received
			lineCache.push(null); // Add a null entry to signify stream end
		} else {
			remainingData += dataBlock; // Append new data to the leftover buffer
			const lineDelimiterRegex = /.*(\r?\n|\r)/g; // Regex to find full lines
			let regexMatch;
			let lastPosition = 0x0;

			// Extract all complete lines from the remaining data
			while (null !== (regexMatch = lineDelimiterRegex.exec(remainingData))) {
				lastPosition = lineDelimiterRegex.lastIndex;
				lineCache.push(regexMatch[0]);
			}
			remainingData = remainingData.substring(lastPosition); // Update remainingData with the unparsed part
		}
		processingCycle(); // Initiate the main processing loop
	}

	/*
	 * The core processing loop that feeds tokens to the main routine.
	 */
	function processingCycle () {
		while (0x0 < lineCache.length) { // Continue as long as there are lines in the cache
			switch (currentParsingState) { // Determine how to process the current line
				case STATE_LINE_READ:
				{
					tokenBuffer.push(lineCache.shift()); // Add the entire line as a token
				}
				break;
				case STATE_WORD_READ:
				{
					if (null === lineCache[0x0]) { // If the current line is null (end of input)
						tokenBuffer.push(lineCache.shift()); // Pass the null token
					} else {
						const wordDelimiterRegex = /[^\s]+/g; // Regex to find individual words
						let currentLineMatch;
						if (null !== (currentLineMatch = wordDelimiterRegex.exec(lineCache[0x0]))) { // If a word is found
							tokenBuffer.push(currentLineMatch[0x0]); // Add the word to the token buffer
							lineCache[0x0] = lineCache[0x0].substring(wordDelimiterRegex.lastIndex); // Remove the extracted word from the line
						} else {
							lineCache.shift(); // If no word found, discard the line
						}
					}
				}
				break;
			}

			while (0x0 < tokenBuffer.length) { // Process all available tokens
				let iteratorResult = routineIterator.next(tokenBuffer.shift()); // Advance the main generator with the next token
				if (void 0 !== iteratorResult.value) { // If the generator yielded a value
					if ('string' === typeof iteratorResult.value) { // Check if it's a string
						sendData(iteratorResult.value, ""); // Output the string directly
					} else {
						sendData(`${iteratorResult.value}`, ""); // Convert to string and output
					}
				}
				if (iteratorResult.done) return; // If the generator has finished, exit
			}
		}

		// If no more lines are available, either process a final null chunk or resume input
		streamConcluded ? setTimeout(processInputBlock, 0x0, null) : process.stdin.resume();
	}

	process.stdin.on('data', processInputBlock); // Register handler for incoming data
	process.stdin.on('end', function () { // Register handler for end of input stream
		streamConcluded = true; // Set flag that stream has ended
		processInputBlock(null); // Process a final null chunk to flush remaining data
	});

	process.stdin.setEncoding('utf8'); // Set encoding for input stream
	processInputBlock(null); // Initial call to process an empty chunk, to kick off the loop
};

const systemUtilities = require('os');