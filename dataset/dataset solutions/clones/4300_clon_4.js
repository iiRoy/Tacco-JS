function processGridData(rawData) {
    const allLines = rawData.split('\n');
    const dimensions = allLines[0].split(' ');
    const matrixHeight = parseInt(dimensions[0], 10);
    const matrixWidth = parseInt(dimensions[1], 10);

    let currentGridMap = [];
    let totalDotCells = 0;
    let totalHashCells = 0;

    for (let r = 1; r <= matrixHeight; r++) {
        const gridRowString = allLines[r];
        const charArrayRow = [];
        for (let c = 0; c < matrixWidth; c++) {
            charArrayRow.push(gridRowString[c]);
            if (gridRowString[c] === '.') {
                totalDotCells++;
            } else if (gridRowString[c] === '#') {
                totalHashCells++;
            }
        }
        currentGridMap.push(charArrayRow);
    }

    if (totalDotCells === 0) {
        // Scenario 1: Grid contains only bombs
        const finalOutput = currentGridMap.map(row => row.join('')).join('\n') + '\n';
        console.log(finalOutput);
    } else if (totalHashCells === 0) {
        // Scenario 2: Grid contains only empty spaces
        const finalOutput = currentGridMap.map(row => row.map(() => '0').join('')).join('\n') + '\n';
        console.log(finalOutput);
    } else {
        // Scenario 3: Mixed grid, calculate adjacent bombs
        const deltaCoords = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        const calculateAdjacentBombCount = (yPos, xPos, boardState) => {
            let nearbyExplosives = 0;
            for (const [dy, dx] of deltaCoords) {
                const newY = yPos + dy;
                const newX = xPos + dx;

                if (newY >= 0 && newY < matrixHeight && newX >= 0 && newX < matrixWidth) {
                    if (boardState[newY][newX] === '#') {
                        nearbyExplosives++;
                    }
                }
            }
            return nearbyExplosives;
        };

        for (let y = 0; y < matrixHeight; y++) {
            for (let x = 0; x < matrixWidth; x++) {
                if (currentGridMap[y][x] === '.') {
                    const bombCount = calculateAdjacentBombCount(y, x, currentGridMap);
                    currentGridMap[y][x] = bombCount.toString();
                }
            }
        }
        const finalOutput = currentGridMap.map(row => row.join('')).join('\n') + '\n';
        console.log(finalOutput);
    }
}