const calculateHashNeighbors = (currentRowIndex, currentColIndex, gridData) => {
    let hashNeighborCount = 0;
    const rowOffsets = [-1, 0, 1];
    const colOffsets = [-1, 0, 1];

    for (const rOffset of rowOffsets) {
        for (const cOffset of colOffsets) {
            if (rOffset === 0 && cOffset === 0) {
                continue;
            }

            const neighborRow = currentRowIndex + rOffset;
            const neighborCol = currentColIndex + cOffset;

            const isRowValid = neighborRow >= 0 && neighborRow < gridData.length;
            const isColValid = isRowValid && neighborCol >= 0 && neighborCol < gridData[0].length;

            if (isRowValid && isColValid) {
                if (gridData[neighborRow][neighborCol] === '#') {
                    hashNeighborCount++;
                }
            }
        }
    }
    return hashNeighborCount;
};

const transformInputGrid = (rawInputData) => {
    const allInputLines = rawInputData.split('\n');
    const relevantDataLines = allInputLines.slice(1).filter(lineStr => lineStr.length > 0);
    const characterGrid = relevantDataLines.map(gridLine => gridLine.split(''));

    const processedGridRows = characterGrid.map((currentGridRow, rIdx, fullGrid) => {
        const processedRowCharacters = currentGridRow.map((cellChar, cIdx) => {
            if (cellChar === '#') {
                return '#';
            } else {
                const neighborCountValue = calculateHashNeighbors(rIdx, cIdx, fullGrid);
                return String(neighborCountValue);
            }
        });
        return processedRowCharacters.join('');
    });

    return processedGridRows.join('\n');
};

console.log(transformInputGrid(require('fs').readFileSync('/dev/stdin', 'utf8')));
