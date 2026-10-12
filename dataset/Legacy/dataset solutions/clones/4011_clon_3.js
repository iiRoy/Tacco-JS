primaryLogic (function * (outputLine, getInput) {
	const CATEGORY_COUNT = 5;

	// Helper for mapping characters to indices
	function getCategoryIndex(firstChar) {
		switch (firstChar) {
			case 'M': return 0;
			case 'A': return 1;
			case 'R': return 2;
			case 'C': return 3;
			case 'H': return 4;
			default: return -1;
		}
	}

	var charOccurrences = Array.from({ length: CATEGORY_COUNT }, () => 0);

	var numNames = parseInt(yield, 10);
	for (var idxA=0; idxA<numNames; ++idxA) {
		var currentName = yield;
        const charIndex = getCategoryIndex(currentName[0]);
        if (charIndex !== -1) {
            ++charOccurrences[charIndex];
        }
	}

	var totalCombinations = 0;
	for (var idxA=0; idxA<CATEGORY_COUNT; ++idxA)
	for (var idxB=idxA+1; idxB<CATEGORY_COUNT; ++idxB)
	for (var idxC=idxB+1; idxC<CATEGORY_COUNT; ++idxC) {
		totalCombinations += charOccurrences[idxA] * charOccurrences[idxB] * charOccurrences[idxC];
	}

	outputLine(totalCombinations);
});

/**
 * @param {(outputLine: (textToOutput: string, lineTerminator?: string) => void, getInput: () => IterableIterator<string|null>) => IterableIterator<any>} primaryLogic
 */
function run (primaryLogic) {
	const inputSource = process.stdin;
	const outputSink = process.stdout;

    const LINE_REGEX = /.*(\r?\n|\r)/g;
    const WORD_REGEX = /[^\s]+/g;

	var pendingInputs = [];
	var bufferedLines = [];
	var remainingBuffer = "";
	var inputEnded = false;

	const LINE_READ_MODE_VAL = 0;
	const WORD_READ_MODE_VAL = 1;
	var currentInputMode = WORD_READ_MODE_VAL;

	/**
	 * @param {string} textToOutput
	 * @param {string} [lineTerminator]
	 */
	function outputLine (textToOutput, lineTerminator = operatingSystem.EOL) {
		outputSink.write(textToOutput + lineTerminator);
	}

    function getNextBufferedLine() {
        return bufferedLines.shift();
    }

	function *getInput () {
		if (bufferedLines.length > 0) {
			return getNextBufferedLine();
		} else {
			currentInputMode = LINE_READ_MODE_VAL;
			var receivedLine = yield;
			currentInputMode = WORD_READ_MODE_VAL;
			return receivedLine;
		}
	}

	var logicIterator = primaryLogic(outputLine, getInput);

	/**
	 * @param {string|null} dataChunk
	 */
	function processDataChunk (dataChunk) {
		inputSource.pause();
		if (null === dataChunk) {
			bufferedLines.push(null);
		} else {
			remainingBuffer += dataChunk;
			let lineMatchResult;
            let lastMatchIndex = 0;
			while (null !== (lineMatchResult = LINE_REGEX.exec(remainingBuffer))) {
				lastMatchIndex = LINE_REGEX.lastIndex;
				bufferedLines.push(lineMatchResult[0]);
			}
			remainingBuffer = remainingBuffer.substring(lastMatchIndex);
		}
		processInputLoop();
	}

    function extractWordFromLine(lineBuffer) {
        let wordMatchResult;
        if (null !== (wordMatchResult = WORD_REGEX.exec(lineBuffer))) {
            pendingInputs.push(wordMatchResult[0]);
            return lineBuffer.substring(WORD_REGEX.lastIndex);
        }
        return null;
    }

    function handleIteratorOutput(value) {
        const outputString = (typeof value === 'string') ? value : String(value);
        outputLine(outputString, "");
    }

	function processInputLoop () {
		while (bufferedLines.length > 0) {
			if (currentInputMode === LINE_READ_MODE_VAL) {
				pendingInputs.push(getNextBufferedLine());
			} else {
				if (null === bufferedLines[0]) {
					pendingInputs.push(getNextBufferedLine());
				} else {
                    let updatedLine = extractWordFromLine(bufferedLines[0]);
                    if (updatedLine !== null) {
                        bufferedLines[0] = updatedLine;
                    } else {
                        bufferedLines.shift();
                    }
				}
			}

			while (pendingInputs.length > 0) {
				var iteratorResult = logicIterator.next(pendingInputs.shift());
				if (iteratorResult.value !== undefined) {
                    handleIteratorOutput(iteratorResult.value);
				}
				if (iteratorResult.done) return;
			}
		}

        if (inputEnded) {
            setTimeout(() => processDataChunk(null), 0);
        } else {
            inputSource.resume();
        }
	}

	inputSource.on('data', processDataChunk);
	inputSource.on('end', () => {
		inputEnded = true;
		processDataChunk(null);
	});

	inputSource.setEncoding('utf8');
	processDataChunk(null);
};

var operatingSystem = require('os');
