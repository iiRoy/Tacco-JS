const osModule = require('os');

function executeProgram (programGenerator) {
    const inputStream = process.stdin;
    const outputStream = process.stdout;
    const NEWLINE_CHAR = osModule.EOL;

    let bufferedWords = [];
    let bufferedLines = [];
    let remainingInput = "";
    let inputEnded = false;

    const LINE_READ_MODE = 0;
    const WORD_READ_MODE = 1;
    let currentInputMode = WORD_READ_MODE;

    const outputWriter = (textToWrite, lineEnding) => {
        const actualEnding = (lineEnding === undefined) ? NEWLINE_CHAR : lineEnding;
        outputStream.write(textToWrite + actualEnding);
    };

    function *inputGetter () {
        if (bufferedLines.length > 0) {
            return bufferedLines.shift();
        } else {
            currentInputMode = LINE_READ_MODE;
            const receivedLine = yield;
            currentInputMode = WORD_READ_MODE;
            return receivedLine;
        }
    }

    const programIterator = programGenerator(outputWriter, inputGetter);

    const processInputChunk = (inputChunk) => {
        inputStream.pause();
        if (inputChunk === null) {
            bufferedLines.push(null);
        } else {
            remainingInput += inputChunk;
            const lineExtractionRegex = /.*(\r?\n|\r)/g;
            let currentMatch;
            let lastProcessedIndex = 0;
            while ((currentMatch = lineExtractionRegex.exec(remainingInput)) !== null) {
                lastProcessedIndex = lineExtractionRegex.lastIndex;
                bufferedLines.push(currentMatch[0]);
            }
            remainingInput = remainingInput.substring(lastProcessedIndex);
        }
        processBufferedInput();
    };

    const handleLineModeInput = () => {
        if (bufferedLines.length > 0) {
            bufferedWords.push(bufferedLines.shift());
        }
    };

    const handleWordModeInput = () => {
        if (bufferedLines.length === 0) {
            return;
        }

        const currentLine = bufferedLines[0];
        if (currentLine === null) {
            bufferedWords.push(bufferedLines.shift());
            return;
        }

        const wordExtractionRegex = /[^\s]+/g;
        const wordMatch = wordExtractionRegex.exec(currentLine);

        if (wordMatch !== null) {
            bufferedWords.push(wordMatch[0]);
            bufferedLines[0] = currentLine.substring(wordExtractionRegex.lastIndex);
        } else {
            bufferedLines.shift();
        }
    };

    const processBufferedInput = () => {
        while (bufferedLines.length > 0) {
            if (currentInputMode === LINE_READ_MODE) {
                handleLineModeInput();
            } else {
                handleWordModeInput();
            }

            while (bufferedWords.length > 0) {
                const iteratorResult = programIterator.next(bufferedWords.shift());
                if (iteratorResult.value !== undefined) {
                    outputWriter(String(iteratorResult.value), "");
                }
                if (iteratorResult.done) {
                    return;
                }
            }
        }

        if (!inputEnded) {
            inputStream.resume();
        } else {
            setTimeout(() => processInputChunk(null), 0);
        }
    };

    inputStream.on('data', processInputChunk);
    inputStream.on('end', () => {
        inputEnded = true;
        processInputChunk(null);
    });

    inputStream.setEncoding('utf8');
    processInputChunk(null);
}

executeProgram (function * (outputWriter, inputGetter) {
    const WIDTH_UNITS = 50;
    const TOTAL_WIDTH_PX = WIDTH_UNITS * 2;

    const WHITE_ACTIVE_PATTERN_A = ".#";
    const WHITE_ACTIVE_PATTERN_B = "##";
    const WHITE_INACTIVE_PATTERN_A = "##";
    const WHITE_INACTIVE_PATTERN_B = "##";

    const BLACK_ACTIVE_PATTERN_A = "..";
    const BLACK_ACTIVE_PATTERN_B = "#.";
    const BLACK_INACTIVE_PATTERN_A = "..";
    const BLACK_INACTIVE_PATTERN_B = "..";

    const initialWhiteInput = yield;
    let wCount = +initialWhiteInput - 1;

    const initialBlackInput = yield;
    let bCount = +initialBlackInput - 1;

    const outputLines = [];

    const buildLinePair = (remainingCount, activeA, activeB, inactiveA, inactiveB) => {
        let currentLineA = "";
        let currentLineB = "";
        let currentRemaining = remainingCount;

        for (let unitIdx = 0; unitIdx < WIDTH_UNITS; ++unitIdx) {
            if (currentRemaining > 0) {
                currentLineA += activeA;
                currentLineB += activeB;
                currentRemaining--;
            } else {
                currentLineA += inactiveA;
                currentLineB += inactiveB;
            }
        }
        return { lineA: currentLineA, lineB: currentLineB, newCount: currentRemaining };
    };

    do {
        const { lineA, lineB, newCount } = buildLinePair(
            wCount,
            WHITE_ACTIVE_PATTERN_A, WHITE_ACTIVE_PATTERN_B,
            WHITE_INACTIVE_PATTERN_A, WHITE_INACTIVE_PATTERN_B
        );
        outputLines.push(lineA, lineB);
        wCount = newCount;
    } while (wCount > 0);

    do {
        const { lineA, lineB, newCount } = buildLinePair(
            bCount,
            BLACK_ACTIVE_PATTERN_A, BLACK_ACTIVE_PATTERN_B,
            BLACK_INACTIVE_PATTERN_A, BLACK_INACTIVE_PATTERN_B
        );
        outputLines.push(lineA, lineB);
        bCount = newCount;
    } while (bCount > 0);

    outputWriter(`${outputLines.length} ${TOTAL_WIDTH_PX}`);
    for (let lineIndex = 0; lineIndex < outputLines.length; ++lineIndex) {
        outputWriter(outputLines[lineIndex]);
    }
});
