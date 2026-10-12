const processInput = (inputLines) => {
    const [heightStr, widthStr] = inputLines[0].split(" ");
    const gridHeight = Number(heightStr);
    const gridWidth = Number(widthStr);

    const numericGrid = inputLines.slice(1).map(rowString =>
        rowString.split(" ").map(Number)
    );

    const collectOddCellCoordinates = Array.from({ length: gridHeight }, (_, rowIndex) => {
        const oneIndexedRow = rowIndex + 1;
        const rowValues = numericGrid[rowIndex];
        const columnIndices = Array.from({ length: gridWidth }, (_, colIndex) => colIndex);

        if (rowIndex % 2 === 0) { // Corresponds to 1-indexed odd rows (left-to-right traversal)
            return columnIndices.map(colIndex => ({
                r: oneIndexedRow,
                c: colIndex + 1,
                val: rowValues[colIndex]
            }));
        } else { // Corresponds to 1-indexed even rows (right-to-left traversal)
            return columnIndices.reverse().map(colIndex => ({
                r: oneIndexedRow,
                c: colIndex + 1,
                val: rowValues[colIndex]
            }));
        }
    }).flat()
    .filter(cell => cell.val % 2 === 1)
    .map(cell => [cell.r, cell.c]);

    const generatePathSegments = (initialPoint, finalPoint) => {
        const segments = [];
        let [currentR, currentC] = initialPoint;
        const [targetR, targetC] = finalPoint;

        const horizontalSteps = Array.from({ length: Math.abs(targetC - currentC) }, () => {
            const nextC = currentC + (targetC > currentC ? 1 : -1);
            const segment = [currentR, currentC, currentR, nextC];
            currentC = nextC;
            return segment;
        });
        segments.push(...horizontalSteps);

        const verticalSteps = Array.from({ length: targetR - currentR }, () => {
            const nextR = currentR + 1;
            const segment = [currentR, currentC, nextR, currentC];
            currentR = nextR;
            return segment;
        });
        segments.push(...verticalSteps);

        return segments;
    };

    const allMovementInstructions = collectOddCellCoordinates.reduce((accumulator, currentCoordinate, index) => {
        if (index % 2 === 0) {
            return { ...accumulator, pendingStartCoordinate: currentCoordinate };
        } else {
            const start = accumulator.pendingStartCoordinate;
            const end = currentCoordinate;
            const pairPaths = generatePathSegments(start, end);
            return { paths: accumulator.paths.concat(pairPaths), pendingStartCoordinate: null };
        }
    }, { paths: [], pendingStartCoordinate: null }).paths;

    console.log(allMovementInstructions.length);
    console.log(allMovementInstructions.join("\n"));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
