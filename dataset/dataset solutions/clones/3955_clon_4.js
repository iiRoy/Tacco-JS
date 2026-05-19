const os = require('os');

function run (mainProgram) {
    const inputSource = process.stdin;
    const outputSink = process.stdout;

    /**
     * @type {Array<string|null>}
     */
    let tokenBuffer = [];
    /**
     * @type {Array<string>}
     */
    let lineBuffer = [];
    let remainingInput = "";
    let inputFinished = false;
    const LINE_READ_MODE = 0;
    const WORD_READ_MODE = 1;
    let currentReadMode = WORD_READ_MODE;

    /**
     * @param {string} textLine
     * @param {string} [terminator]
     */
    function printLine (textLine, terminator) {
        outputSink.write(textLine + (undefined === terminator ? os.EOL : terminator));
    }
    function *fetchInput () {
        if (0 < lineBuffer.length) {
            return lineBuffer.shift();
        } else {
            currentReadMode = LINE_READ_MODE;
            /**
             * @type {string}
             */
            const fetchedLine = yield;
            currentReadMode = WORD_READ_MODE;
            return fetchedLine;
        }
    }

    const programIterator = mainProgram(printLine, fetchInput);

    /**
     * @param {string|null} dataChunk
     */
    function processInputChunk (dataChunk) {
        inputSource.pause();
        if (null === dataChunk) {
            lineBuffer.push(null);
        } else {
            remainingInput += dataChunk;
            const lineExtractor = /.*(\r?\n|\r)/g;
            let lineMatch, lastProcessedIndex = 0;
            while (null !== (lineMatch = lineExtractor.exec(remainingInput))) {
                lastProcessedIndex = lineExtractor.lastIndex;
                lineBuffer.push(lineMatch[0]);
            }
            remainingInput = remainingInput.substring(lastProcessedIndex);
        }
        processBuffers();
    }

    function processBuffers () {
        while (0 < lineBuffer.length) {
            switch (currentReadMode) {
                case LINE_READ_MODE:
                {
                    tokenBuffer.push(lineBuffer.shift());
                }
                break;
                case WORD_READ_MODE:
                {
                    if (null === lineBuffer[0]) {
                        tokenBuffer.push(lineBuffer.shift());
                    } else {
                        const wordExtractor = /[^\s]+/g;
                        let wordMatch;
                        if (null !== (wordMatch = wordExtractor.exec(lineBuffer[0]))) {
                            tokenBuffer.push(wordMatch[0]);
                            lineBuffer[0] = lineBuffer[0].substring(wordExtractor.lastIndex);
                        } else {
                            lineBuffer.shift();
                        }
                    }
                }
                break;
            }

            while (0 < tokenBuffer.length) {
                const iterationResult = programIterator.next(tokenBuffer.shift());
                if (undefined !== iterationResult.value) {
                    if ('string' === typeof iterationResult.value) {
                        printLine(iterationResult.value, "");
                    } else {
                        printLine(`${iterationResult.value}`, "");
                    }
                }
                if (iterationResult.done) return;
            }
        }

        inputFinished ? setTimeout(processInputChunk, 0, null) : inputSource.resume();
    }
    inputSource.on('data', processInputChunk);
    inputSource.on('end', function () {
        inputFinished = true;
        processInputChunk(null);
    });

    inputSource.setEncoding('utf8');
    processInputChunk(null);
}

run (function * (outputWriter, inputReader) {
    const pointCount = +(yield inputReader.next().value);

    const pathNodes = [0];
    for (let k = 0; k < pointCount; ++k) {
        pathNodes.push(+(yield inputReader.next().value));
    }
    pathNodes.push(0);

    const totalPathLength = pathNodes.slice(0, -1).reduce((currentSum, currentPoint, index) => {
        const nextPoint = pathNodes[index + 1];
        return currentSum + Math.abs(currentPoint - nextPoint);
    }, 0);

    const calculatedResults = Array.from({ length: pointCount }, (_, removalIndex) => {
        const previousSegmentPoint = pathNodes[removalIndex];
        const currentRemovalPoint = pathNodes[removalIndex + 1];
        const subsequentSegmentPoint = pathNodes[removalIndex + 2];

        const segmentsThroughRemovedPoint = Math.abs(previousSegmentPoint - currentRemovalPoint) + Math.abs(currentRemovalPoint - subsequentSegmentPoint);
        const directSegmentLength = Math.abs(previousSegmentPoint - subsequentSegmentPoint);

        return totalPathLength - segmentsThroughRemovedPoint + directSegmentLength;
    });

    outputWriter(calculatedResults.map(String).join(os.EOL) + os.EOL);
});
