function initiateProcessing (processingUnit) {
	const inputSource = process.stdin;
	const outputSink = process.stdout;

	const bufferedWords = [];
	const bufferedLines = [];
	let remainingBuffer = "";
	let inputFinished = false;
	const LINE_INPUT_MODE = 0;
	const WORD_INPUT_MODE = 1;
	let currentInputMode = WORD_INPUT_MODE;

	function emitOutput (content, terminator) {
		outputSink.write(content + (undefined === terminator ? os.EOL : terminator));
	}

	function *acquireInput () {
		if (bufferedLines.length > 0) {
			return bufferedLines.shift();
		} else {
			currentInputMode = LINE_INPUT_MODE;
			const receivedLine = yield;
			currentInputMode = WORD_INPUT_MODE;
			return receivedLine;
		}
	}

	const mainProcessor = processingUnit(emitOutput, acquireInput);

	function processChunk (dataChunk) {
		inputSource.pause();
		if (null === dataChunk) {
			bufferedLines.push(null);
		} else {
			remainingBuffer += dataChunk;
			const linePattern = /.*(\r?\n|\r)/g;
			let lineMatchResult;
			let lastProcessedIndex = 0;
			while (null !== (lineMatchResult = linePattern.exec(remainingBuffer))) {
				lastProcessedIndex = linePattern.lastIndex;
				bufferedLines.push(lineMatchResult[0]);
			}
			remainingBuffer = remainingBuffer.substring(lastProcessedIndex);
		}
		executeProcessingCycle();
	}

    const inputModeHandlers = {
        [LINE_INPUT_MODE]: () => {
            bufferedWords.push(bufferedLines.shift());
        },
        [WORD_INPUT_MODE]: () => {
            if (null === bufferedLines[0]) {
                bufferedWords.push(bufferedLines.shift());
            } else {
                const currentLineContent = bufferedLines[0];
                const wordPattern = /^[^\s]+/;
                const firstWordMatch = currentLineContent.match(wordPattern);
                if (firstWordMatch) {
                    bufferedWords.push(firstWordMatch[0]);
                    bufferedLines[0] = currentLineContent.substring(firstWordMatch[0].length);
                } else {
                    bufferedLines.shift();
                }
            }
        }
    };

	function executeProcessingCycle () {
		while (bufferedLines.length > 0) {
            inputModeHandlers[currentInputMode]();

			while (bufferedWords.length > 0) {
				const iterationResult = mainProcessor.next(bufferedWords.shift());
				if (undefined !== iterationResult.value) {
					if ('string' === typeof iterationResult.value) {
						emitOutput(iterationResult.value, "");
					} else {
						emitOutput(`${iterationResult.value}`, "");
					}
				}
				if (iterationResult.done) return;
			}
		}

		inputFinished ? setTimeout(processChunk, 0, null) : process.stdin.resume();
	}
	inputSource.on('data', processChunk);
	inputSource.on('end', function () {
		inputFinished = true;
		processChunk(null);
	});

	inputSource.setEncoding('utf8');
	processChunk(null);
}

function obtainSubsets(sourceArray, subsetSize) {
    const collection = [];
    const elements = [...sourceArray];

    function formSubset(startIndex, currentSubset) {
        if (currentSubset.length === subsetSize) {
            collection.push([...currentSubset]);
            return;
        }
        for (let idx = startIndex; idx < elements.length; idx++) {
            currentSubset.push(elements[idx]);
            formSubset(idx + 1, currentSubset);
            currentSubset.pop();
        }
    }
    formSubset(0, []);
    return collection;
}


initiateProcessing (function * (outputWriter, inputReader) {
	const initialCharacterMap = new Map([
		['M', 0], ['A', 1], ['R', 2], ['C', 3], ['H', 4]
	]);
	const letterTallies = Array(5).fill(0);

	const totalEntries = parseInt(yield, 10);
	
	for (let entryIndex = 0; entryIndex < totalEntries; ++entryIndex) {
		const entryName = yield;
		const firstLetter = entryName[0];
		const targetIndex = initialCharacterMap.get(firstLetter);
		if (targetIndex !== undefined) {
			letterTallies[targetIndex]++;
		}
	}

	const indexSet = [0, 1, 2, 3, 4];
	const threeElementCombinations = obtainSubsets(indexSet, 3);

	const finalSum = threeElementCombinations.reduce((accumulator, currentCombo) => {
		const [idxA, idxB, idxC] = currentCombo;
		return accumulator + (letterTallies[idxA] * letterTallies[idxB] * letterTallies[idxC]);
	}, 0);

	outputWriter(finalSum);
});

const os = require('os');
