process.stdin.resume();
process.stdin.setEncoding('utf8');
let rawInputBuffer = '';

process.stdin.on('data', function (dataChunk) {
    rawInputBuffer += dataChunk;
});

process.stdin.on('end', function () {
    const inputLines = rawInputBuffer.split('\n');

    const parseNumericLine = (textLine) =>
        textLine.trim().split(' ').map(Number);

    const [gridWidth, gridHeight] = parseNumericLine(inputLines[0]);

    const initialGrid = inputLines
        .slice(1)
        .filter(Boolean)
        .map(rowString => Array.from(rowString));

    const directionalVectors = [-1, 0, 1].flatMap(rowOffset =>
        [-1, 0, 1].map(colOffset => [rowOffset, colOffset])
    ).filter(([rowOffset, colOffset]) => rowOffset !== 0 || colOffset !== 0);

    const finalGrid = Array.from({ length: gridHeight }, (_, currentRow) =>
        Array.from({ length: gridWidth }, (_, currentCol) => {
            const currentCellContent = initialGrid[currentRow][currentCol];

            if (currentCellContent === '#') {
                return '#';
            }

            const bombNeighborCount = directionalVectors.reduce((accumulator, [dr, dc]) => {
                const neighborRow = currentRow + dr;
                const neighborCol = currentCol + dc;

                const isWithinBounds =
                    neighborRow >= 0 && neighborRow < gridHeight &&
                    neighborCol >= 0 && neighborCol < gridWidth;

                if (isWithinBounds && initialGrid[neighborRow][neighborCol] === '#') {
                    return accumulator + 1;
                }
                return accumulator;
            }, 0);

            return bombNeighborCount;
        })
    );

    finalGrid.forEach(processedRow => {
        console.log(processedRow.join(''));
    });
});
