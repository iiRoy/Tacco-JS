executeApplication(function * processPatterns (outputEmitter, dataAcquirer) {
    let initialFigure = +(yield) - 1;
    let finalFigure = +(yield) - 1;

    const resultantGrid = [];

    let currentFirstFigure = initialFigure;
    do {
        const segments = Array.from({ length: 50 }, () => {
            if (currentFirstFigure > 0) {
                currentFirstFigure--;
                return { firstComponent: '.\u0023', secondComponent: '\u0023\u0023' };
            } else {
                return { firstComponent: '\u0023\u0023', secondComponent: '\u0023\u0023' };
            }
        });

        const pieceA = segments.map(s => s.firstComponent).join('');
        const pieceB = segments.map(s => s.secondComponent).join('');

        resultantGrid.push(pieceA, pieceB);
    } while (currentFirstFigure > 0);

    let currentSecondFigure = finalFigure;
    do {
        const components = Array.from({ length: 50 }, () => {
            if (currentSecondFigure > 0) {
                currentSecondFigure--;
                return { primaryPart: '..', secondaryPart: '\u0023.' };
            } else {
                return { primaryPart: '..', secondaryPart: '..' };
            }
        });

        const pieceC = components.map(c => c.primaryPart).join('');
        const pieceD = components.map(c => c.secondaryPart).join('');

        resultantGrid.push(pieceC, pieceD);
    } while (currentSecondFigure > 0);

    outputEmitter(`${resultantGrid.length} 100`);
    resultantGrid.forEach(item => outputEmitter(item));
});

function executeApplication (coreOperation) {
    const systemInputPipe = process.stdin;
    const systemOutputPipe = process.stdout;

    const tokenQueue = [];
    const lineBuffer = [];
    let remainingInput = "";
    let inputFinished = false;

    const MODE_WHOLE_LINE = 0;
    const MODE_SINGLE_TOKEN = 1;
    let currentInputMode = MODE_SINGLE_TOKEN;

    function emitOutput (textValue, terminationChar) {
        systemOutputPipe.write(textValue + (undefined === terminationChar ? systemInfo.EOL : terminationChar));
    }

    function * retrieveInput () {
        if (lineBuffer.length > 0) {
            return lineBuffer.shift();
        } else {
            currentInputMode = MODE_WHOLE_LINE;
            const receivedText = yield;
            currentInputMode = MODE_SINGLE_TOKEN;
            return receivedText;
        }
    }

    const logicIterator = coreOperation(emitOutput, retrieveInput);

    function handleInputSegment (segmentData) {
        systemInputPipe.pause();
        if (null === segmentData) {
            lineBuffer.push(null);
        } else {
            remainingInput += segmentData;
            const lineMatcher = /.*(\r?\n|\r)/g;
            let currentLineMatch;
            let lastProcessedIndex = 0;
            while (null !== (currentLineMatch = lineMatcher.exec(remainingInput))) {
                lastProcessedIndex = lineMatcher.lastIndex;
                lineBuffer.push(currentLineMatch[0]);
            }
            remainingInput = remainingInput.substring(lastProcessedIndex);
        }
        processBufferedData();
    }

    function processBufferedData () {
        while (lineBuffer.length > 0) {
            if (currentInputMode === MODE_WHOLE_LINE) {
                tokenQueue.push(lineBuffer.shift());
            } else if (currentInputMode === MODE_SINGLE_TOKEN) {
                if (null === lineBuffer[0]) {
                    tokenQueue.push(lineBuffer.shift());
                } else {
                    const tokenMatcher = /[^\s]+/g;
                    let currentTokenMatch;
                    if (null !== (currentTokenMatch = tokenMatcher.exec(lineBuffer[0]))) {
                        tokenQueue.push(currentTokenMatch[0]);
                        lineBuffer[0] = lineBuffer[0].substring(tokenMatcher.lastIndex);
                    } else {
                        lineBuffer.shift();
                    }
                }
            }

            while (tokenQueue.length > 0) {
                const operationResult = logicIterator.next(tokenQueue.shift());
                if (undefined !== operationResult.value) {
                    if ('string' === typeof operationResult.value) {
                        emitOutput(operationResult.value, "");
                    } else {
                        emitOutput(`${operationResult.value}`, "");
                    }
                }
                if (operationResult.done) return;
            }
        }

        inputFinished ? setTimeout(handleInputSegment, 0, null) : systemInputPipe.resume();
    }

    systemInputPipe.on('data', handleInputSegment);
    systemInputPipe.on('end', function () {
        inputFinished = true;
        handleInputSegment(null);
    });

    systemInputPipe.setEncoding('utf8');
    handleInputSegment(null);
}

var systemInfo = require('os');