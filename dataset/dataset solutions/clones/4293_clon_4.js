process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputBuffer = '';
process.stdin.on('data', (dataChunk) => {
    inputBuffer += dataChunk;
});

process.stdin.on('end', () => {
    processInputData(inputBuffer.split(/\r?\n/));
});

function processInputData(receivedLines) {
    const valueStrings = receivedLines[0].split(' ');

    const sortedValues = [...valueStrings].sort();

    const uniqueElement = sortedValues[0] === sortedValues[1] ? sortedValues[2] : sortedValues[0];

    console.log(uniqueElement);

    return 0;
}
