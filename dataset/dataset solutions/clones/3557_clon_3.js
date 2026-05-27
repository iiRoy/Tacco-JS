function processGridData(input) {
    const firstLineParts = input[0].split(" ");
    const gridHeight = parseInt(firstLineParts[0], 10);
    const gridWidth = parseInt(firstLineParts[1], 10);

    const oddCellCoords = [];

    const addOddCellCoordinate = (row, col, value) => {
        if (value % 2 === 1) {
            oddCellCoords.push([row, col]);
        }
    };

    for (let rowIdx = 1; rowIdx <= gridHeight; rowIdx++) {
        const currentRowValues = input[rowIdx].split(" ");

        if (rowIdx % 2 === 1) {
            currentRowValues.forEach((cellValueStr, colIdx) => {
                const cellValue = parseInt(cellValueStr, 10);
                addOddCellCoordinate(rowIdx, colIdx + 1, cellValue);
            });
        } else {
            currentRowValues.reverse().forEach((cellValueStr, colIdx) => {
                const cellValue = parseInt(cellValueStr, 10);
                addOddCellCoordinate(rowIdx, gridWidth - colIdx, cellValue);
            });
        }
    }

    const moveSequence = [];
    const numPairs = Math.floor(oddCellCoords.length / 2);

    for (let pairIdx = 0; pairIdx < numPairs; pairIdx++) {
        const currentPos = oddCellCoords[pairIdx * 2];
        const targetPos = oddCellCoords[pairIdx * 2 + 1];

        const tempCurrentPos = [...currentPos];

        while (tempCurrentPos[0] !== targetPos[0] || tempCurrentPos[1] !== targetPos[1]) {
            const prevRow = tempCurrentPos[0];
            const prevCol = tempCurrentPos[1];
            let nextRow = prevRow;
            let nextCol = prevCol;

            if (tempCurrentPos[1] !== targetPos[1]) {
                if (tempCurrentPos[1] < targetPos[1]) {
                    nextCol++;
                } else {
                    nextCol--;
                }
            } else {
                nextRow++;
            }
            moveSequence.push([prevRow, prevCol, nextRow, nextCol]);
            tempCurrentPos[0] = nextRow;
            tempCurrentPos[1] = nextCol;
        }
    }

    console.log(moveSequence.length);
    console.log(moveSequence.join("\n"));
}

processGridData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
