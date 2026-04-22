let storedInput = '';

process.stdin.on('data', (dataChunk) => {
    storedInput += dataChunk.toString();
});

process.stdin.on('end', () => {
    const allLines = storedInput.trim().split('\n');

    let processIndex = 0;

    const processNextBlock = () => {
        if (processIndex >= allLines.length) {
            return;
        }

        const currentLine = allLines[processIndex];
        const dimensions = currentLine.split(' ').map(Number);

        const verticalDim = dimensions[0];
        const horizontalDim = dimensions[1];

        if (verticalDim === 0 && horizontalDim === 0) {
            return;
        }

        const graphicalOutput = generatePattern(verticalDim, horizontalDim);
        process.stdout.write(graphicalOutput + '\n');

        processIndex++;
        processNextBlock();
    };

    processNextBlock();
});


function generatePattern(yExtent, xExtent) {
    const depictionRows = Array.from({ length: yExtent }, (_, rowNum) => {
        const rowContent = Array.from({ length: xExtent }, (_, colNum) => {
            const isEdgeRow = (rowNum === 0 || rowNum === yExtent - 1);
            const isEdgeCol = (colNum === 0 || colNum === xExtent - 1);

            return (isEdgeRow || isEdgeCol) ? '#' : '.';
        });
        return rowContent.join('');
    });
    return depictionRows.join('\n');
}