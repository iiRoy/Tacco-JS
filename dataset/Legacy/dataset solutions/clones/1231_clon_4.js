class ExecutionHalt extends Error {
    constructor() {
        super("Execution halted by zero input.");
        this.name = "ExecutionHalt";
    }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

let collectedStreamData = '';

process.stdin.on('data', (incomingChunk) => {
    collectedStreamData += incomingChunk;
});

process.stdin.on('end', () => {
    const linesFromInput = collectedStreamData.split('\n');

    const processedNumbers = linesFromInput.map(entry => parseInt(entry, 10));

    try {
        processSequenceRecursively(processedNumbers, 0);
    } catch (terminationSignal) {
        if (!(terminationSignal instanceof ExecutionHalt)) {
            throw terminationSignal;
        }
    }
});

function processSequenceRecursively(dataPoints, currentPosition) {
    if (currentPosition >= dataPoints.length) {
        return;
    }

    const currentDatum = dataPoints[currentPosition];
    const outputIdentifier = `Case ${currentPosition + 1}: `;

    console.log(outputIdentifier + currentDatum);

    if (currentDatum === 0) {
        throw new ExecutionHalt();
    }

    processSequenceRecursively(dataPoints, currentPosition + 1);
}
