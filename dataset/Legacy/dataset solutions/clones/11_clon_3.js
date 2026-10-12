let accumulatedInput = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(receivedChunk) {
    accumulatedInput += receivedChunk;
});

process.stdin.on('end', function() {
    handleProcessedData(accumulatedInput);
});

function parseLineToNumbers(lineContent) {
    const stringNumbers = lineContent.split(' ');
    const parsedNumbers = stringNumbers.map(function(numericString) {
        return parseInt(numericString);
    });
    return parsedNumbers;
}

function handleProcessedData(fullInputString) {
    const rawLineSegments = fullInputString.split('\n');

    const numericPairs = rawLineSegments.map(currentLine => {
        return parseLineToNumbers(currentLine);
    });

    for (const numberTuple of numericPairs) {
        const [firstValue, secondValue] = numberTuple;
        console.log(firstValue + secondValue);
    }
}
