function performGridTransformation(dataLines) {
    const [rowsCount, colsCount] = dataLines[0].split(' ').map(Number);

    const numericGrid = dataLines.slice(1, rowsCount + 1).map(line => line.split(' ').map(Number));

    const oddCellRegistry = Array.from({ length: rowsCount * colsCount }, (_, cellIndex) => {
        const zeroIndexedRow = Math.floor(cellIndex / colsCount);
        const zeroIndexedCol = (zeroIndexedRow % 2 === 0)
            ? cellIndex % colsCount
            : colsCount - 1 - (cellIndex % colsCount);

        const oneIndexedRow = zeroIndexedRow + 1;
        const oneIndexedCol = zeroIndexedCol + 1;

        return {
            row: oneIndexedRow,
            col: oneIndexedCol,
            value: numericGrid[zeroIndexedRow][zeroIndexedCol]
        };
    })
    .filter(cellInfo => cellInfo.value % 2 !== 0)
    .map(cellInfo => [cellInfo.row, cellInfo.col]);

    const constructMovementSequence = (initialLocation, finalLocation) => {
        const generatePathSteps = (currentLocation, targetLocation, currentMoves) => {
            const [currentR, currentC] = currentLocation;
            const [targetR, targetC] = targetLocation;

            if (currentR === targetR && currentC === targetC) {
                return currentMoves;
            }

            if (currentC !== targetC) {
                const nextC = (currentC < targetC) ? currentC + 1 : currentC - 1;
                const newMove = [currentR, currentC, currentR, nextC];
                return generatePathSteps([currentR, nextC], targetLocation, [...currentMoves, newMove]);
            } else {
                const nextR = (currentR < targetR) ? currentR + 1 : currentR - 1;
                const newMove = [currentR, currentC, nextR, currentC];
                return generatePathSteps([nextR, currentC], targetLocation, [...currentMoves, newMove]);
            }
        };
        return generatePathSteps(initialLocation, finalLocation, []);
    };

    const collectedInstructions = oddCellRegistry.reduce((allInstructions, currentPoint, idx, fullList) => {
        if (idx % 2 === 0 && idx + 1 < fullList.length) {
            const originPoint = currentPoint;
            const terminalPoint = fullList[idx + 1];
            return [...allInstructions, ...constructMovementSequence(originPoint, terminalPoint)];
        }
        return allInstructions;
    }, []);

    console.log(collectedInstructions.length);
    console.log(collectedInstructions.join("\n"));
}

performGridTransformation(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));