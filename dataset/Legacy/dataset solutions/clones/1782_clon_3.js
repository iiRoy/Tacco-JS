function*stdinIter(){const inputData=require("fs").readFileSync("/dev/stdin","utf-8").trim().split(/\n|\s/);yield*inputData}
function readInputTokens(count, iteratorRef){
    const currentIterator = iteratorRef || this.inputIterator || (this.inputIterator = stdinIter());
    const tokens = [];
    for(let i = 0; i < count; i += 1) {
        tokens.push(currentIterator.next().value);
    }
    return tokens;
}

(() => {
    const parseNumeric = (str) => parseInt(str, 10);
    const [ gridHeight, gridWidth, maxMoveDist ] = readInputTokens(3).map(parseNumeric);
    const [ startX, startY, endX, endY ] = readInputTokens(4).map(val => parseNumeric(val) - 1);

    const initialGrid = [];
    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx += 1) {
        const gridRowChars = readInputTokens(1)[0].split('');
        initialGrid.push(gridRowChars);
    }

    const distanceGrid = Array.from({ length: gridHeight }, (_, r) =>
        Array.from({ length: gridWidth }, (_, c) =>
            initialGrid[r][c] === '@' ? -1 : null
        )
    );

    distanceGrid[startX][startY] = 0;
    let processingQueue = [[ startX, startY ]];

    const isWithinBounds = (r, c) => r >= 0 && r < gridHeight && c >= 0 && c < gridWidth;

    const getGridValue = (r, c) => {
        if (!isWithinBounds(r, c)) {
            return undefined;
        }
        return distanceGrid[r][c];
    };

    const setGridValue = (r, c, val) => {
        if (isWithinBounds(r, c)) {
            distanceGrid[r][c] = val;
        }
    };

    const movementDirections = [
        { dr: 1, dc: 0 }, // Down
        { dr: -1, dc: 0 }, // Up
        { dr: 0, dc: 1 }, // Right
        { dr: 0, dc: -1 }  // Left
    ];

    while (processingQueue.length > 0) {
        const currentCellCoords = processingQueue.shift();
        const [ currentRow, currentCol ] = currentCellCoords;
        const currentCellDistance = getGridValue(currentRow, currentCol);
        const nextDistanceValue = currentCellDistance + 1;

        for (const direction of movementDirections) {
            const { dr, dc } = direction;
            for (let stepSize = 1; stepSize <= maxMoveDist; stepSize += 1) {
                const nextRow = currentRow + dr * stepSize;
                const nextCol = currentCol + dc * stepSize;

                const targetValue = getGridValue(nextRow, nextCol);

                if (targetValue === undefined || targetValue === -1) {
                    break;
                }

                if (targetValue === null) {
                    setGridValue(nextRow, nextCol, nextDistanceValue);
                    processingQueue.push([ nextRow, nextCol ]);
                }
            }
        }
    }

    const finalDistance = getGridValue(endX, endY);
    console.log(finalDistance === null ? '-1' : finalDistance);
})();
