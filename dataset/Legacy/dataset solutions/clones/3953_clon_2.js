executeProgram(function*(outputLine, fetchInput) {
    let countOfElements = +(yield);
    const deltas = [];
    let totalAbsoluteDifference = 0;
    let previousValue = 0;
    // Iterate through the input values to calculate differences and their sum
    for (let currentIdx = 0; currentIdx < countOfElements; ++currentIdx) {
        let incomingValue = +(yield);
        deltas.push(previousValue - incomingValue);
        totalAbsoluteDifference += Math.abs(previousValue - incomingValue);
        previousValue = incomingValue;
    }
    // Handle the final segment, typically from the last value to zero
    deltas.push(previousValue - 0);
    totalAbsoluteDifference += Math.abs(previousValue - 0);

    let outputAccumulator = "";
    // Construct the final output string based on calculated deltas
    for (let currentIdx = 0; currentIdx < countOfElements; ++currentIdx) {
        outputAccumulator += (totalAbsoluteDifference - Math.abs(deltas[currentIdx]) - Math.abs(deltas[currentIdx + 1]) + Math.abs(deltas[currentIdx] + deltas[currentIdx + 1]));
    }
    outputLine(outputAccumulator);
});

/**
 * Orchestrates the execution of a generator-based program, handling input/output.
 * @param {(outputLine: (content: string, ending?: string) => void, fetchInput: () => IterableIterator<string|null>) => IterableIterator<any>} programLogic
 */
function executeProgram(programLogic) {
    const dataStreamIn = process.stdin;
    const dataStreamOut = process.stdout;

    /**
     * @type {Array<string|null>}
     */
    let inputTokensBuffer = [];
    /**
     * @type {Array<string>}
     */
    let bufferedInputLines = [];
    let pendingBuffer = "";
    let endOfInputReached = false;
    // Constants for input parsing modes
    const LINE_INPUT_MODE = 0;
    const WORD_INPUT_MODE = 1;
    let currentParsingMode = WORD_INPUT_MODE;

    /**
     * Writes a string to the output stream, optionally with a custom terminator.
     * @param {string} content
     * @param {string} [ending]
     */
    function outputLine(content, ending) {
        dataStreamOut.write(content + (undefined === ending ? systemUtilities.EOL : ending));
    }

    /**
     * A generator function to retrieve input tokens or lines.
     * @returns {IterableIterator<string|null>}
     */
    function* fetchInput() {
        if (0 < bufferedInputLines.length) {
            return bufferedInputLines.shift();
        } else {
            currentParsingMode = LINE_INPUT_MODE;
            /**
             * @type {string}
             */
            let receivedLine = yield;
            currentParsingMode = WORD_INPUT_MODE;
            return receivedLine;
        }
    }

    const programFlowIterator = programLogic(outputLine, fetchInput);

    /**
     * Processes a new data chunk received from the input stream.
     * @param {string|null} dataBlock
     */
    function handleIncomingData(dataBlock) {
        dataStreamIn.pause(); // Temporarily pause reading to process current data
        if (null === dataBlock) {
            bufferedInputLines.push(null);
        } else {
            pendingBuffer += dataBlock;
            const lineSplitRegex = /.*(\r?\n|\r)/g;
            let lineMatchResult, lastProcessedIndex = 0;
            while (null !== (lineMatchResult = lineSplitRegex.exec(pendingBuffer))) {
                lastProcessedIndex = lineSplitRegex.lastIndex;
                bufferedInputLines.push(lineMatchResult[0]);
            }
            pendingBuffer = pendingBuffer.substring(lastProcessedIndex);
        }
        processExecutionLoop();
    }

    /**
     * The main loop that drives the program's execution, pulling input and pushing output.
     */
    function processExecutionLoop() {
        while (0 < bufferedInputLines.length) {
            switch (currentParsingMode) {
                case LINE_INPUT_MODE:
                    {
                        inputTokensBuffer.push(bufferedInputLines.shift());
                    }
                    break;
                case WORD_INPUT_MODE:
                    {
                        if (null === bufferedInputLines[0]) {
                            inputTokensBuffer.push(bufferedInputLines.shift());
                        } else {
                            const wordTokenizerRegex = /[^\s]+/g;
                            let currentLineMatch;
                            if (null !== (currentLineMatch = wordTokenizerRegex.exec(bufferedInputLines[0]))) {
                                inputTokensBuffer.push(currentLineMatch[0]);
                                bufferedInputLines[0] = bufferedInputLines[0].substring(wordTokenizerRegex.lastIndex);
                            } else {
                                bufferedInputLines.shift(); // No words found, discard line
                            }
                        }
                    }
                    break;
            }

            while (0 < inputTokensBuffer.length) {
                const iterationResult = programFlowIterator.next(inputTokensBuffer.shift());
                if (undefined !== iterationResult.value) {
                    if ('string' === typeof iterationResult.value) {
                        outputLine(iterationResult.value, "");
                    } else {
                        outputLine(`${iterationResult.value}`, "");
                    }
                }
                if (iterationResult.done) return;
            }
        }

        // If input has ended, schedule a final chunk processing; otherwise, resume reading
        endOfInputReached ? setTimeout(handleIncomingData, 0, null) : dataStreamIn.resume();
    }
    dataStreamIn.on('data', handleIncomingData);
    dataStreamIn.on('end', function() {
        endOfInputReached = true;
        handleIncomingData(null);
    });

    dataStreamIn.setEncoding('utf8');
    // Start the process by feeding an initial null chunk to trigger the loop
    handleIncomingData(null);
}

const systemUtilities = require('os');