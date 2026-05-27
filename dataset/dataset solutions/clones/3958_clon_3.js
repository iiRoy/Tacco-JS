run(function* (outputStr, fetchInput) {
    const TILE_GROUP_SIZE = 50;
    const OUTPUT_LINE_LENGTH = 100;
    const INITIAL_OFFSET = 1;
    const CALC_MULTIPLIER = 2;

    let wCount = +(yield fetchInput()) - INITIAL_OFFSET;
    let bCount = +(yield fetchInput()) - INITIAL_OFFSET;

    // Helper for initial calculation
    const calculateInitialComponent = (countVal) => {
        if (countVal < INITIAL_OFFSET) return 0;
        return Math.floor((countVal - INITIAL_OFFSET) / TILE_GROUP_SIZE) * CALC_MULTIPLIER + CALC_MULTIPLIER;
    };

    const totalInitialValue = calculateInitialComponent(wCount) + calculateInitialComponent(bCount);
    outputStr(`${totalInitialValue} ${OUTPUT_LINE_LENGTH}`);

    // Helper function to construct a pair of output lines
    const constructOutputLines = (currentRemaining, activePattern, inactivePattern, decrementAction) => {
        let firstSegment = "";
        let secondSegment = "";
        for (let segmentIndex = 0; segmentIndex < OUTPUT_LINE_LENGTH; segmentIndex += CALC_MULTIPLIER) {
            if (currentRemaining > 0) {
                firstSegment += activePattern.first;
                secondSegment += activePattern.second;
                decrementAction();
            } else {
                firstSegment += inactivePattern.first;
                secondSegment += inactivePattern.second;
            }
        }
        return { firstSegment, secondSegment };
    };

    // White tile processing
    do {
        const whiteTilePatterns = {
            active: { first: ".#", second: "##" },
            inactive: { first: "##", second: "##" }
        };
        const { firstSegment, secondSegment } = constructOutputLines(
            wCount,
            whiteTilePatterns.active,
            whiteTilePatterns.inactive,
            () => wCount--
        );
        outputStr(firstSegment);
        outputStr(secondSegment);
    } while (wCount > 0);

    // Black tile processing
    do {
        const blackTilePatterns = {
            active: { first: "..", second: "#." },
            inactive: { first: "..", second: ".." }
        };
        const { firstSegment, secondSegment } = constructOutputLines(
            bCount,
            blackTilePatterns.active,
            blackTilePatterns.inactive,
            () => bCount--
        );
        outputStr(firstSegment);
        outputStr(secondSegment);
    } while (bCount > 0);
});

/**
 * @param {(mainLogicGenerator: (outputStr: (line: string, end?: string) => void, fetchInput: () => IterableIterator<string|null>) => IterableIterator<any>) => void} mainLogicGenerator
 */
function run(mainLogicGenerator) {
    const inputSourceStream = process.stdin;
    const outputDestinationStream = process.stdout;

    const LINE_INPUT_MODE = 0;
    const WORD_INPUT_MODE = 1;

    let bufferedTokens = [];
    let bufferedLines = [];
    let remainingInputBuffer = "";
    let inputProcessingEnded = false;
    let currentInputProcessingMode = WORD_INPUT_MODE;

    // Helper for consistent EOL
    const getSystemEOL = () => os.EOL;

    /**
     * @param {string} contentLine
     * @param {string} [terminator]
     */
    function printOutput(contentLine, terminator) {
        const finalTerminator = (terminator === undefined) ? getSystemEOL() : terminator;
        outputDestinationStream.write(contentLine + finalTerminator);
    }

    function* retrieveInput() {
        if (bufferedLines.length > 0) {
            return bufferedLines.shift();
        } else {
            currentInputProcessingMode = LINE_INPUT_MODE;
            const yieldedLine = yield; // Wait for input
            currentInputProcessingMode = WORD_INPUT_MODE;
            return yieldedLine;
        }
    }

    const mainGeneratorInstance = mainLogicGenerator(printOutput, retrieveInput);

    /**
     * Parses raw chunk into lines and adds to bufferedLines.
     * @param {string|null} rawChunk
     */
    const parseChunkIntoLines = (rawChunk) => {
        if (rawChunk === null) {
            bufferedLines.push(null);
            return;
        }
        remainingInputBuffer += rawChunk;
        const lineSplitRegex = /.*(\r?\n|\r)/g;
        let lineMatchResult;
        let lastProcessedIndex = 0;
        while ((lineMatchResult = lineSplitRegex.exec(remainingInputBuffer)) !== null) {
            lastProcessedIndex = lineSplitRegex.lastIndex;
            bufferedLines.push(lineMatchResult[0]);
        }
        remainingInputBuffer = remainingInputBuffer.substring(lastProcessedIndex);
    };

    /**
     * Processes an incoming data chunk from stdin.
     * @param {string|null} chunkData
     */
    function handleInputChunk(chunkData) {
        inputSourceStream.pause(); // Pause stream to manage flow
        parseChunkIntoLines(chunkData);
        executeProcessingLoop();
    }

    // Helper for processing a single line in LINE_INPUT_MODE
    const processLineModeInput = () => {
        bufferedTokens.push(bufferedLines.shift());
    };

    // Helper for processing a single word in WORD_INPUT_MODE
    const processWordModeInput = () => {
        const currentLine = bufferedLines[0];
        if (currentLine === null) {
            bufferedTokens.push(bufferedLines.shift());
        } else {
            const wordExtractRegex = /[^\s]+/g;
            let wordMatchResult;
            if ((wordMatchResult = wordExtractRegex.exec(currentLine)) !== null) {
                bufferedTokens.push(wordMatchResult[0]);
                bufferedLines[0] = currentLine.substring(wordExtractRegex.lastIndex);
            } else {
                bufferedLines.shift(); // No words found, discard line
            }
        }
    };

    // Helper for advancing the main generator
    const advanceMainGenerator = () => {
        while (bufferedTokens.length > 0) {
            const nextToken = bufferedTokens.shift();
            const genResult = mainGeneratorInstance.next(nextToken);

            if (genResult.value !== undefined) {
                // Ensure output is always a string, as per original behavior
                const outputValue = (typeof genResult.value === 'string') ? genResult.value : String(genResult.value);
                printOutput(outputValue, "");
            }
            if (genResult.done) return true; // Generator finished
        }
        return false; // Generator not finished
    };

    function executeProcessingLoop() {
        while (bufferedLines.length > 0) {
            switch (currentInputProcessingMode) {
                case LINE_INPUT_MODE:
                    processLineModeInput();
                    break;
                case WORD_INPUT_MODE:
                    processWordModeInput();
                    break;
            }

            if (advanceMainGenerator()) return; // If generator finished, exit
        }

        // If no more buffered lines, either schedule end or resume input
        if (inputProcessingEnded) {
            // Using setImmediate for non-blocking execution, similar to setTimeout(..., 0)
            setImmediate(handleInputChunk, null);
        } else {
            inputSourceStream.resume();
        }
    }

    inputSourceStream.on('data', handleInputChunk);
    inputSourceStream.on('end', () => {
        inputProcessingEnded = true;
        handleInputChunk(null);
    });

    inputSourceStream.setEncoding('utf8');
    handleInputChunk(null); // Initial call to kick off processing
}

const os = require('os');
