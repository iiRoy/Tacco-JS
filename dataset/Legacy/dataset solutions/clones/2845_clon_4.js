class DataStreamProcessor {
    #sourceLines;
    #currentLineIndex = 0;

    constructor(lines) {
        this.#sourceLines = lines;
    }

    #retrieveNextLine() {
        if (this.#currentLineIndex >= this.#sourceLines.length) {
            throw new Error('Input exhaustion: No more lines to process.');
        }
        return this.#sourceLines[this.#currentLineIndex++];
    }

    extractInteger() {
        return parseInt(this.#retrieveNextLine(), 10);
    }

    extractIntegerArray() {
        return this.#retrieveNextLine().split(' ').map(Number);
    }

    static assembleOutput(dataElements, joinType) {
        switch (joinType) {
            case 'space': return dataElements.join(' ');
            case 'newline': return dataElements.join('\n');
            case 'concat': return dataElements.join('');
            default: return dataElements;
        }
    }
}

let inputBuffer = [];
let streamHandler;

require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
}).on('line', (currentLine) => {
    inputBuffer.push(currentLine);
}).on('close', () => {
    streamHandler = new DataStreamProcessor(inputBuffer);
    console.error('\n↑入力 ↓出力');
    processCoreLogic();
});

function processCoreLogic() {
    const elementCount = streamHandler.extractInteger();
    const numericSequence = streamHandler.extractIntegerArray();

    numericSequence.sort((a, b) => a - b);

    const intermediateSum = numericSequence.slice(1, elementCount - 1)
                                          .reduce((acc, val) => acc + Math.abs(val), 0);
    const calculatedMagnitude = numericSequence[elementCount - 1] - numericSequence[0] + intermediateSum;
    console.log(calculatedMagnitude);

    const initialAccumulatorState = {
        currentLeft: numericSequence[0],
        currentRight: numericSequence[elementCount - 1],
        logEntries: []
    };

    const { currentLeft: finalLeft, currentRight: finalRight, logEntries: intermediateLog } =
        numericSequence.slice(1, elementCount - 1).reduce((acc, currentNumber) => {
            let { currentLeft, currentRight, logEntries } = acc;
            let entryString;

            if (currentNumber < 0) {
                entryString = `${currentRight} ${currentNumber}`;
                currentRight -= currentNumber;
            } else {
                entryString = `${currentLeft} ${currentNumber}`;
                currentLeft -= currentNumber;
            }
            logEntries.push(entryString);
            return { currentLeft, currentRight, logEntries };
        }, initialAccumulatorState);

    intermediateLog.push(`${finalRight} ${finalLeft}`);

    console.log(DataStreamProcessor.assembleOutput(intermediateLog, 'newline'));
}
