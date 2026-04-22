let receivedLines = [];
let currentLinePosition = 0;

function grabNextLine() {
    if (currentLinePosition >= receivedLines.length) {
        throw new Error('Input exhausted.');
    }
    return receivedLines[currentLinePosition++];
}

function parseNumericalInput() {
    return parseInt(grabNextLine(), 10);
}

function sendOutput(value) {
    console.log(value);
}

function evaluateCalculation() {
    let upperLimit = parseNumericalInput();
    let totalAccumulation = 0;
    let iterationIndex = 1;

    while (iterationIndex <= upperLimit) {
        let currentGroupValue = Math.floor(upperLimit / iterationIndex);
        let nextIndexBoundary = Math.floor(upperLimit / currentGroupValue) + 1;

        let blockEndIndex = nextIndexBoundary - 1;
        let sumOfIndicesInBlock = (iterationIndex + blockEndIndex) * (blockEndIndex - iterationIndex + 1) / 2;

        let sumFromOneToGroupValue = currentGroupValue * (currentGroupValue + 1) / 2;
        
        totalAccumulation += sumFromOneToGroupValue * sumOfIndicesInBlock;

        iterationIndex = nextIndexBoundary;
    }
    sendOutput(totalAccumulation);
}

const inputHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

inputHandler.on('line', function(textLine) {
    receivedLines.push(textLine);
});

inputHandler.on('close', function() {
    const operationStart = Date.now();
    evaluateCalculation();
    const operationDuration = Date.now() - operationStart;
    console.error('\n');
    console.error('diagnostics: execution duration: ' + operationDuration + 'ms');
    console.error('diagnostics: heap usage: ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});