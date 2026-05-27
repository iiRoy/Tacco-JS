function processInputData(inputLines) {
    let lineCursor = 0;

    while (inputLines[lineCursor] !== '0 0') {
        const currentInputLine = inputLines[lineCursor];

        const [rectHeight, rectWidth] = currentInputLine.split(/\s+/).map(Number);

        const gridContent = Array.from({ length: rectHeight }, (_, rowIdx) =>
            Array.from({ length: rectWidth }, (_, colIdx) =>
                (colIdx + rowIdx) % 2 === 0 ? '#' : '.'
            ).join('')
        ).join('\n') + '\n';

        console.log(gridContent);

        lineCursor++;
    }
}

const inputBufferSegments = [];
process.stdin.on('data', (dataChunk) => {
    inputBufferSegments.push(dataChunk);
});
process.stdin.on('end', () => {
    const processedLines = inputBufferSegments.join('').split('\n');
    processInputData(processedLines);
});
