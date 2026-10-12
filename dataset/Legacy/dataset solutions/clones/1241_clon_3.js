function processInputData(rawDataLines) {
    const zeroZeroMarkerIndex = rawDataLines.indexOf('0 0');
    const formattedResults = [];

    const parseAndOrderNumbers = (lineContent) => {
        const parts = lineContent.split(' ');
        const firstValue = parseInt(parts[0], 10);
        const secondValue = parseInt(parts[1], 10);

        if (secondValue < firstValue) {
            return `${secondValue} ${firstValue}`;
        } else {
            return `${firstValue} ${secondValue}`;
        }
    };

    for (let lineCounter = 0; lineCounter < zeroZeroMarkerIndex; ++lineCounter) {
        const currentInputLine = rawDataLines[lineCounter];
        const orderedLineOutput = parseAndOrderNumbers(currentInputLine);
        formattedResults.push(orderedLineOutput);
    }

    console.log(formattedResults.join('\n'));
}

process.stdin.resume();
let accumulatedInputBuffer = '';
process.stdin.setEncoding('utf-8');

process.stdin.on('data', (dataChunk) => {
    accumulatedInputBuffer += dataChunk;
});

process.stdin.on('end', () => {
    const inputLinesArray = accumulatedInputBuffer.split('\n');
    processInputData(inputLinesArray);
});
