run (function * (outputLine, fetchInput) {
	const divisorValue = 3;
	const rawInputString = yield;
	const parsedNumber = parseInt(rawInputString, 10);
	const divisionResult = parsedNumber / divisorValue;
	outputLine(Math.floor(divisionResult));
});

/**
 * @param {(outputLine: (text: string, endChar?: string) => void, fetchInput: () => IterableIterator<string|null>) => IterableIterator<any>} mainFn
 */
function executeMainGenerator (mainFn) {
	const inputStream = process.stdin;
	const outputStream = process.stdout;
	const osModule = require('os');
	const OS_NEWLINE = osModule.EOL;

	/**
	 * @type {[string|null]}
	 */
	var inputTokens = [];
	/**
	 * @type {[string]}
	 */
	var bufferedLines = [];
	var remainingInputBuffer = "";
	var inputProcessingEnded = false;

	const INPUT_MODES = {
		LINE_READ: 0,
		WORD_READ: 1
	};
	var currentReadMode = INPUT_MODES.WORD_READ;

	/**
	 * Writes text to the output stream, handling cork/uncork.
	 * @param {string} text
	 */
	function flushOutput (text) {
		outputStream.cork();
		outputStream.write(text);
		outputStream.uncork();
	}

	/**
	 * @param {string} textToWrite
	 * @param {string} [lineEndChar]
	 */
	function writeOutput (textToWrite, lineEndChar) {
		const effectiveEndChar = lineEndChar === undefined ? OS_NEWLINE : lineEndChar;
		flushOutput(textToWrite + effectiveEndChar);
	}

	/**
	 * Generator function to fetch input.
	 */
	function *getInput () {
		if (bufferedLines.length > 0) {
			return bufferedLines.shift();
		} else {
			currentReadMode = INPUT_MODES.LINE_READ;
			/**
			 * @type {string}
			 */
			const fetchedLine = yield;
			currentReadMode = INPUT_MODES.WORD_READ;
			return fetchedLine;
		}
	}

	const mainGenerator = mainFn(writeOutput, getInput);

	/**
	 * Extracts complete lines from the remaining input buffer and adds them to bufferedLines.
	 */
	function extractLinesFromBuffer () {
		const lineSplitRegex = /.*(\r?\n|\r)/g;
		let matchedLine;
		let lastProcessedIndex = 0;
		while ((matchedLine = lineSplitRegex.exec(remainingInputBuffer)) !== null) {
			lastProcessedIndex = lineSplitRegex.lastIndex;
			bufferedLines.push(matchedLine[0]);
		}
		remainingInputBuffer = remainingInputBuffer.substring(lastProcessedIndex);
	}

	/**
	 * Processes an incoming data chunk from stdin.
	 * @param {string|null} dataChunk
	 */
	function processDataChunk (dataChunk) {
		inputStream.pause();
		if (dataChunk === null) {
			bufferedLines.push(null);
		} else {
			remainingInputBuffer += dataChunk;
			extractLinesFromBuffer();
		}
		processInputLoop();
	}

	/**
	 * Processes the next available input token based on the current read mode.
	 */
	function processNextInputToken () {
		if (currentReadMode === INPUT_MODES.LINE_READ) {
			inputTokens.push(bufferedLines.shift());
		} else if (currentReadMode === INPUT_MODES.WORD_READ) {
			if (bufferedLines[0] === null) {
				inputTokens.push(bufferedLines.shift());
			} else {
				const wordSplitRegex = /[^\s]+/g;
				let currentLineMatch;
				if ((currentLineMatch = wordSplitRegex.exec(bufferedLines[0])) !== null) {
					inputTokens.push(currentLineMatch[0]);
					bufferedLines[0] = bufferedLines[0].substring(wordSplitRegex.lastIndex);
				} else {
					bufferedLines.shift();
				}
			}
		}
	}

	/**
	 * Handles the result value from the main generator.
	 * @param {any} resultValue
	 */
	function handleGeneratorOutput (resultValue) {
		if (resultValue !== undefined) {
			const outputValue = typeof resultValue === 'string' ? resultValue : String(resultValue);
			writeOutput(outputValue, "");
		}
	}

	/**
	 * Main loop for processing buffered input and feeding the generator.
	 */
	function processInputLoop () {
		while (bufferedLines.length > 0) {
			processNextInputToken();

			while (inputTokens.length > 0) {
				const generatorResult = mainGenerator.next(inputTokens.shift());
				handleGeneratorOutput(generatorResult.value);
				if (generatorResult.done) return;
			}
		}

		const continueInputFlow = () => {
			if (inputProcessingEnded) {
				setTimeout(processDataChunk, 0, null);
			} else {
				inputStream.resume();
			}
		};
		continueInputFlow();
	}

	/**
	 * Handles the 'end' event from the input stream.
	 */
	function handleInputEnd () {
		inputProcessingEnded = true;
		processDataChunk(null);
	}

	inputStream.on('data', processDataChunk);
	inputStream.on('end', handleInputEnd);

	inputStream.setEncoding('utf8');
	processDataChunk(null);
}
