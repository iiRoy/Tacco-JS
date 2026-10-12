run (function * (outputWriter, inputGetterPlaceholder) {
    const ZERO_VAL = 0;
    let countVal = Number(yield);
    let diffsArr = [];
    let totalAbsDiff = ZERO_VAL;
    let prevVal = ZERO_VAL;

    for (let idx = ZERO_VAL; idx < countVal; ++idx) {
        let currentVal = Number(yield);
        let currentDiff = prevVal - currentVal;
        diffsArr.push(currentDiff);
        totalAbsDiff += Math.abs(currentDiff);
        prevVal = currentVal;
    }

    let finalDiff = prevVal - ZERO_VAL;
    diffsArr.push(finalDiff);
    totalAbsDiff += Math.abs(finalDiff);

    let resultStr = "";

    const calculateReduction = (valA, valB) => {
        const absA = Math.abs(valA);
        const absB = Math.abs(valB);
        const absSum = Math.abs(valA + valB);
        return absA + absB - absSum;
    };

    for (let idx = ZERO_VAL; idx < countVal; ++idx) {
        const currentCost = diffsArr[idx];
        const nextCost = diffsArr[idx + 1];
        const reductionAmount = calculateReduction(currentCost, nextCost);
        resultStr += (totalAbsDiff - reductionAmount);
    }
    outputWriter(resultStr);
});

/**
 * @param {(outputWriter: (line: string, end?: string) => void, inputGetterPlaceholder: () => IterableIterator<string|null>) => IterableIterator<any>} mainProgram
 */
function run (mainProgram) {
    const inputSource = process.stdin;
    const outputSink = process.stdout;
    const NEWLINE_CHAR = os.EOL;

    /**
     * @type {[string|null]}
     */
    let bufferedTokens = [];
    /**
     * @type {[string]}
     */
    let bufferedLines = [];
    let remainingBuffer = "";
    let inputEnded = false;

    const WORD_MODE_CONSTANT = 1;
    let currentInputMode = WORD_MODE_CONSTANT; // This will always remain WORD_MODE_CONSTANT as the 'gets' generator is unused.

    /**
     * @param {string} outputLineContent
     * @param {string} [lineEndChar]
     */
    function outputLine (outputLineContent, lineEndChar) {
        const effectiveEnd = (lineEndChar === undefined) ? NEWLINE_CHAR : lineEndChar;
        outputSink.write(outputLineContent + effectiveEnd);
    }

    // The original 'gets' generator function is not called by the main program,
    // and thus the 'input_mode' logic for LINE_MODE is dead code.
    // It has been removed as a non-essential code fragment.

    const programIterator = mainProgram(outputLine, null); // Pass null for the unused inputGetterPlaceholder

    /**
     * Helper function to parse lines from a raw chunk and append to bufferedLines.
     * @param {string} rawChunk
     */
    function parseLinesFromChunk(rawChunk) {
        remainingBuffer += rawChunk;
        const lineRegex = /.*(\r?\n|\r)/g;
        let lineMatchResult;
        let lastProcessedIndex = 0;
        while ((lineMatchResult = lineRegex.exec(remainingBuffer)) !== null) {
            lastProcessedIndex = lineRegex.lastIndex;
            bufferedLines.push(lineMatchResult[0]);
        }
        remainingBuffer = remainingBuffer.substring(lastProcessedIndex);
    }

    /**
     * @param {string|null} incomingChunk
     */
    function processInputChunk (incomingChunk) {
        inputSource.pause();
        if (incomingChunk === null) {
            bufferedLines.push(null);
        } else {
            parseLinesFromChunk(incomingChunk);
        }
        processQueue();
    }

    /**
     * Helper to extract a word from the current line in bufferedLines, or handle a null line marker.
     * @returns {string|null|undefined} The extracted word, null if the line itself was null, or undefined if no word was found and the line was processed.
     */
    function extractWordOrHandleNullLine() {
        if (bufferedLines.length === 0) {
            return undefined; // No lines available to process
        }

        if (bufferedLines[0] === null) {
            return bufferedLines.shift(); // Return null and remove the null line marker
        }

        const wordRegex = /[^\s]+/g;
        let wordMatchResult;
        if ((wordMatchResult = wordRegex.exec(bufferedLines[0])) !== null) {
            const extractedWord = wordMatchResult[0];
            bufferedLines[0] = bufferedLines[0].substring(wordRegex.lastIndex);
            return extractedWord;
        } else {
            bufferedLines.shift(); // Current line is empty or only whitespace, remove it
            return undefined; // No word found in this line
        }
    }

    function processQueue () {
        while (bufferedLines.length > 0) {
            // Since currentInputMode is always WORD_MODE_CONSTANT (due to dead code removal),
            // the switch statement is replaced with direct WORD_MODE_CONSTANT logic.
            const nextToken = extractWordOrHandleNullLine();
            if (nextToken !== undefined) {
                bufferedTokens.push(nextToken);
            }

            // Drain bufferedTokens and feed to the main program iterator
            while (bufferedTokens.length > 0) {
                const iterationResult = programIterator.next(bufferedTokens.shift());
                if (iterationResult.value !== undefined) {
                    if (typeof iterationResult.value === 'string') {
                        outputLine(iterationResult.value, "");
                    } else {
                        outputLine(`${iterationResult.value}`, "");
                    }
                }
                if (iterationResult.done) return;
            }
        }

        inputEnded ? setTimeout(processInputChunk, 0, null) : inputSource.resume();
    }

    inputSource.on('data', processInputChunk);
    inputSource.on('end', function () {
        inputEnded = true;
        processInputChunk(null);
    });

    inputSource.setEncoding('utf8');
    processInputChunk(null);
}

const os = require('os');
