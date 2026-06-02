run (function * (outputLine, fetchInput) {
	const getAbs = Math.abs;
	var count = +(yield);
	var diffs = [];
	var totalAbsDiff = 0;
	var prevVal = 0;

	for (var idx = 0; idx < count; ++idx) {
		var currentVal = +(yield);
		const currentDiff = prevVal - currentVal;
		diffs.push(currentDiff);
		totalAbsDiff += getAbs(currentDiff);
		prevVal = currentVal;
	}
	const finalDiff = prevVal - 0;
	diffs.push(finalDiff);
	totalAbsDiff += getAbs(finalDiff);

	var outputBuffer = "";
	for (var idx = 0; idx < count; ++idx) {
		const calculatedValue = totalAbsDiff - getAbs(diffs[idx]) - getAbs(diffs[idx + 1]) + getAbs(diffs[idx] + diffs[idx + 1]);
		outputBuffer += `${calculatedValue}${os.EOL}`;
	}
	console.log(outputBuffer);
});

/**
 * @param {(outputLine: (line: string, end?: string) => void, fetchInput: () => IterableIterator<string|null>) => IterableIterator<any>} entryPoint
 */
function run (entryPoint) {
	const inputSource = process.stdin;
	const outputSink = process.stdout;

	/**
	 * @type {[string|null]}
	 */
	var inputTokens = [];
	/**
	 * @type {[string]}
	 */
	var inputLines = [];
	var remainingBuffer = "";
	var inputEnded = false;

	const LINE_MODE = 0;
	const WORD_MODE = 1;
	var currentInputMode = WORD_MODE;

	/**
	 * @param {string} text
	 * @param {string} [end]
	 */
	function outputLine (text, end) {
		outputSink.write(text + (undefined === end ? os.EOL : end));
	}

	function *fetchInput () {
		if (inputLines.length > 0) {
			return inputLines.shift();
		} else {
			currentInputMode = LINE_MODE;
			/**
			 * @type {string}
			 */
			var lineFromYield = yield;
			currentInputMode = WORD_MODE;
			return lineFromYield;
		}
	}

	const mainGenerator = entryPoint(outputLine, fetchInput);

	function parseIncomingDataChunk(dataChunk) {
		if (null === dataChunk) {
			inputLines.push(null);
		} else {
			remainingBuffer += dataChunk;
			const lineRegex = /.*(\r?\n|\r)/g;
			let lineMatchResult;
			let lastProcessedIndex = 0;
			while (null !== (lineMatchResult = lineRegex.exec(remainingBuffer))) {
				lastProcessedIndex = lineRegex.lastIndex;
				inputLines.push(lineMatchResult[0]);
			}
			remainingBuffer = remainingBuffer.substring(lastProcessedIndex);
		}
	}

	/**
	 * @param {string|null} dataChunk
	 */
	function get_chunk (dataChunk) {
		inputSource.pause();
		parseIncomingDataChunk(dataChunk);
		loop();
	}

	function processLineModeInput() {
		inputTokens.push(inputLines.shift());
	}

	function processWordModeInput() {
		if (null === inputLines[0]) {
			inputTokens.push(inputLines.shift());
		} else {
			const wordRegex = /[^\s]+/g;
			let wordMatchResult;
			if (null !== (wordMatchResult = wordRegex.exec(inputLines[0]))) {
				inputTokens.push(wordMatchResult[0]);
				inputLines[0] = inputLines[0].substring(wordRegex.lastIndex);
			} else {
				inputLines.shift();
			}
		}
	}

	function manageInputSourceResume() {
		if (inputEnded) {
			setTimeout(get_chunk, 0, null);
		} else {
			inputSource.resume();
		}
	}

	function loop () {
		while (inputLines.length > 0) {
			switch (currentInputMode) {
				case LINE_MODE:
					processLineModeInput();
					break;
				case WORD_MODE:
					processWordModeInput();
					break;
			}

			while (inputTokens.length > 0) {
				const genResult = mainGenerator.next(inputTokens.shift());
				if (undefined !== genResult.value) {
					outputLine(String(genResult.value), "");
				}
				if (genResult.done) return;
			}
		}

		manageInputSourceResume();
	}

	function initializeInputSystem() {
		inputSource.on('data', get_chunk);
		inputSource.on('end', function () {
			inputEnded = true;
			get_chunk(null);
		});
		inputSource.setEncoding('utf8');
		get_chunk(null);
	}

	initializeInputSystem();
}

const os = require('os');
