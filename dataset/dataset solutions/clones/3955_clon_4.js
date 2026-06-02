const os = require('os');

function run(mainProgram) {
    const inputSource = process.stdin;
    const outputSink = process.stdout;

    let tokenBuffer = [];
    let lineBuffer = [];
    let remainingInput = "";
    let inputFinished = false;
    const LINE_READ_MODE = 0;
    const WORD_READ_MODE = 1;
    let currentReadMode = WORD_READ_MODE;

    function printLine(textLine, terminator) {
        outputSink.write(textLine + (undefined === terminator ? os.EOL : terminator));
    }

    function* fetchInput() {
        if (0 < lineBuffer.length) {
            return lineBuffer.shift();
        } else {
            currentReadMode = LINE_READ_MODE;
            const fetchedLine = yield;
            currentReadMode = WORD_READ_MODE;
            return fetchedLine;
        }
    }

    const programIterator = mainProgram(printLine, fetchInput);

    function processInputChunk(dataChunk) {
        inputSource.pause();

        if (null === dataChunk) {
            lineBuffer.push(null);
        } else {
            remainingInput += dataChunk;
            const lineExtractor = /.*(\r?\n|\r)/g;
            let lineMatch;
            let lastProcessedIndex = 0;

            while (null !== (lineMatch = lineExtractor.exec(remainingInput))) {
                lastProcessedIndex = lineExtractor.lastIndex;
                lineBuffer.push(lineMatch[0]);
            }

            remainingInput = remainingInput.substring(lastProcessedIndex);
        }

        processBuffers();
    }

    function processBuffers() {
        while (0 < lineBuffer.length) {
            switch (currentReadMode) {
                case LINE_READ_MODE:
                    tokenBuffer.push(lineBuffer.shift());
                    break;

                case WORD_READ_MODE:
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

run(function* (outputWriter) {
    const pointCount = +(yield);

    const pathNodes = [0];

    for (let index = 0; index < pointCount; index++) {
        pathNodes.push(+(yield));
    }

    pathNodes.push(0);

    const totalPathLength = pathNodes.slice(0, -1).reduce(function (sum, currentPoint, index) {
        const nextPoint = pathNodes[index + 1];
        return sum + Math.abs(currentPoint - nextPoint);
    }, 0);

    const calculatedResults = Array.from({ length: pointCount }, function (_, removalIndex) {
        const previousPoint = pathNodes[removalIndex];
        const removedPoint = pathNodes[removalIndex + 1];
        const nextPoint = pathNodes[removalIndex + 2];

        const removedRouteLength = Math.abs(previousPoint - removedPoint) + Math.abs(removedPoint - nextPoint);
        const directRouteLength = Math.abs(previousPoint - nextPoint);

        return totalPathLength - removedRouteLength + directRouteLength;
    });

    outputWriter(calculatedResults.join(os.EOL) + os.EOL);
});