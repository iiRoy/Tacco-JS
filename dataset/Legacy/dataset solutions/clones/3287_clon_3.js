function vectorOperation(vecA, vecB, operationType) {
    let resultVector = [];
    let effectiveVecB = vecB;

    if (vecA.length !== vecB.length) {
        if (vecB.length === 1) {
            effectiveVecB = Array.from({ length: vecA.length }, () => vecB[0]);
        } else {
            return null;
        }
    }

    for (let i = 0; i < vecA.length; i++) {
        switch (operationType) {
            case '+':
                resultVector.push(vecA[i] + effectiveVecB[i]);
                break;
            case '-':
                resultVector.push(vecA[i] - effectiveVecB[i]);
                break;
            case '*':
                resultVector.push(vecA[i] * effectiveVecB[i]);
                break;
            case '/':
                resultVector.push(vecA[i] / effectiveVecB[i]);
                break;
            case '%':
                resultVector.push(vecA[i] % effectiveVecB[i]);
                break;
            case '||':
                resultVector.push(Math.max(vecA[i], effectiveVecB[i]));
                break;
            default:
                resultVector.push(0);
        }
    }
    return resultVector;
}

function processGridData(rawData) {
    const lines = rawData.trim().split("\n");
    const dimensions = lines[0].split(" ").map(Number);
    const gridHeight = dimensions[0];
    const gridWidth = dimensions[1];

    const inputGridRows = [];
    const parityColorMap = [];
    const islandIdGrid = [];

    for (let r = 0; r < gridHeight; r++) {
        inputGridRows.push([lines[r + 1]]);
        parityColorMap.push(Array.from({ length: gridWidth }, () => 0));
        islandIdGrid.push(Array.from({ length: gridWidth }, () => -1));
    }

    for (let r = 0; r < gridHeight; r++) {
        const currentRowString = inputGridRows[r][0];
        for (let c = 0; c < gridWidth; c++) {
            const expectedChar = ((r + c) % 2 === 0) ? '#' : '.';
            if (currentRowString.charAt(c) === expectedChar) {
                parityColorMap[r][c] = 1;
            }
        }
    }

    let nextIslandIdentifier = 0;
    const islandColorCounts = [];
    const islandCellCoordinates = [];

    const getAdjacentIslandIdentifiers = (row, col, currentCellParity) => {
        const adjIds = [];
        if (row > 0 && parityColorMap[row - 1][col] === currentCellParity) {
            adjIds.push(islandIdGrid[row - 1][col]);
        }
        if (col > 0 && parityColorMap[row][col - 1] === currentCellParity) {
            adjIds.push(islandIdGrid[row][col - 1]);
        }
        return adjIds;
    };

    for (let r = 0; r < gridHeight; r++) {
        for (let c = 0; c < gridWidth; c++) {
            const currentCellParityMatch = parityColorMap[r][c];
            const adjacentIslandIdentifiers = getAdjacentIslandIdentifiers(r, c, currentCellParityMatch);
            const currentCellParityType = (r + c) % 2;

            let assignedIslandId;

            if (adjacentIslandIdentifiers.length === 0) {
                assignedIslandId = nextIslandIdentifier;
                islandColorCounts[assignedIslandId] = [0, 0];
                islandCellCoordinates[assignedIslandId] = [];
                nextIslandIdentifier++;
            } else if (adjacentIslandIdentifiers.length === 1) {
                assignedIslandId = adjacentIslandIdentifiers[0];
            } else {
                const idA = adjacentIslandIdentifiers[0];
                const idB = adjacentIslandIdentifiers[1];

                if (idA !== idB) {
                    const minId = Math.min(idA, idB);
                    const maxId = Math.max(idA, idB);

                    const cellsFromMaxIdIsland = islandCellCoordinates[maxId];
                    for (let k = 0; k < cellsFromMaxIdIsland.length; k++) {
                        const cellR = cellsFromMaxIdIsland[k][0];
                        const cellC = cellsFromMaxIdIsland[k][1];
                        islandIdGrid[cellR][cellC] = minId;
                        islandCellCoordinates[minId].push([cellR, cellC]);
                    }

                    islandColorCounts[minId] = vectorOperation(islandColorCounts[minId], islandColorCounts[maxId], '+');

                    islandColorCounts[maxId] = null;
                    islandCellCoordinates[maxId] = null;
                    assignedIslandId = minId;
                } else {
                    assignedIslandId = idA;
                }
            }

            islandIdGrid[r][c] = assignedIslandId;
            islandColorCounts[assignedIslandId][currentCellParityType]++;
            islandCellCoordinates[assignedIslandId].push([r, c]);
        }
    }

    let finalAnswer = 0;
    for (let i = 0; i < islandColorCounts.length; i++) {
        const islandStats = islandColorCounts[i];
        if (islandStats !== null) {
            finalAnswer += islandStats[0] * islandStats[1];
        }
    }
    console.log(finalAnswer);
}

processGridData(require("fs").readFileSync("/dev/stdin", "utf8"));
