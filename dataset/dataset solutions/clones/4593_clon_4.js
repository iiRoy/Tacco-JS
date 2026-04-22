class InputProcessor {
    constructor(sourceData) {
        this.dataSegments = sourceData.split(/ |\n/).filter(segment => segment !== '');
        this.currentPosition = 0;
    }

    fetchNextNumericValue() {
        return Number(this.dataSegments[this.currentPosition++]);
    }

    fetchNextTextSegment() {
        return this.dataSegments[this.currentPosition++];
    }

    constructLayout(heightDimension, widthDimension) {
        const layoutGrid = [];
        for (let r = 0; r < heightDimension; r++) {
            const rowString = this.fetchNextTextSegment();
            layoutGrid.push(Array.from(rowString));
        }
        return layoutGrid;
    }
}

const computeCeilingDivision = (dividend, divisor) => Math.ceil(dividend / divisor);

const calculateShortestPaths = (environmentMap, initialColumn, initialRow) => {
    const totalRows = environmentMap.length;
    const totalCols = environmentMap[0].length;
    const obstacleSymbol = '#';
    const infiniteMetric = Number.MAX_SAFE_INTEGER;

    const pathDistanceGrid = Array.from({ length: totalRows }, () =>
        Array.from({ length: totalCols }, () => infiniteMetric)
    );

    const movementQueue = [[initialColumn, initialRow, 0]]; // [col, row, distance]
    pathDistanceGrid[initialRow][initialColumn] = 0;

    let queueHead = 0;

    const cardinalDirections = [
        { colDelta: 0, rowDelta: -1 }, // Up
        { colDelta: 1, rowDelta: 0 },  // Right
        { colDelta: 0, rowDelta: 1 },  // Down
        { colDelta: -1, rowDelta: 0 }  // Left
    ];

    while (queueHead < movementQueue.length) {
        const [currentC, currentR, currentD] = movementQueue[queueHead++];

        cardinalDirections.forEach(direction => {
            const adjacentC = currentC + direction.colDelta;
            const adjacentR = currentR + direction.rowDelta;
            const nextHopDistance = currentD + 1;

            if (adjacentR < 0 || adjacentR >= totalRows || adjacentC < 0 || adjacentC >= totalCols) {
                return; // Out of bounds
            }

            if (environmentMap[adjacentR][adjacentC] === obstacleSymbol || pathDistanceGrid[adjacentR][adjacentC] <= nextHopDistance) {
                return; // Obstacle or already found a shorter/equal path
            }

            pathDistanceGrid[adjacentR][adjacentC] = nextHopDistance;
            movementQueue.push([adjacentC, adjacentR, nextHopDistance]);
        });
    }

    return pathDistanceGrid;
};

const processGridTraversalChallenge = (rawSystemInput) => {
    const dataParser = new InputProcessor(rawSystemInput);

    const arenaRows = dataParser.fetchNextNumericValue();
    const arenaColumns = dataParser.fetchNextNumericValue();
    const jumpAllowance = dataParser.fetchNextNumericValue();
    const terrainLayout = dataParser.constructLayout(arenaRows, arenaColumns);

    let entryXCoord, entryYCoord;

    terrainLayout.some((rowContent, rowIndex) => {
        const startCharPosition = rowContent.indexOf('S');
        if (startCharPosition !== -1) {
            entryXCoord = startCharPosition;
            entryYCoord = rowIndex;
            return true;
        }
        return false;
    });

    const shortestPathMetrics = calculateShortestPaths(terrainLayout, entryXCoord, entryYCoord);

    let minimalBoundaryPassages = Number.MAX_SAFE_INTEGER;

    for (let rIndex = 0; rIndex < arenaRows; rIndex++) {
        for (let cIndex = 0; cIndex < arenaColumns; cIndex++) {
            const currentCellPathLength = shortestPathMetrics[rIndex][cIndex];

            if (currentCellPathLength > jumpAllowance) {
                continue;
            }

            const passagesToTopEdge = computeCeilingDivision(rIndex, jumpAllowance);
            const passagesToLeftEdge = computeCeilingDivision(cIndex, jumpAllowance);
            const passagesToBottomEdge = computeCeilingDivision(arenaRows - rIndex - 1, jumpAllowance);
            const passagesToRightEdge = computeCeilingDivision(arenaColumns - cIndex - 1, jumpAllowance);

            const directBoundaryPassages = Math.min(
                passagesToTopEdge,
                passagesToLeftEdge,
                passagesToBottomEdge,
                passagesToRightEdge
            ) + 1; // +1 for the current jump

            minimalBoundaryPassages = Math.min(minimalBoundaryPassages, directBoundaryPassages);
        }
    }

    return minimalBoundaryPassages;
};

const initiateChallengeExecution = () => {
    const systemInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
    const finalOutcome = processGridTraversalChallenge(systemInputContent);
    if (finalOutcome !== undefined) {
        console.log(finalOutcome);
    }
};

initiateChallengeExecution();