const filesystemHandler = require('fs');

const limitlessValue = 1000000000;

const rowAlterations = [-1, 0, 1, 0];
const colAlterations = [0, -1, 0, 1];

const makeMatrix = ({ dimensionsX, dimensionsY, initialValue }) => {
    return Array.from({ length: dimensionsX }, () =>
        Array.from({ length: dimensionsY }, () => initialValue)
    );
};

const createGridPoint = (rCoord, cCoord) => ({ r: rCoord, c: cCoord });

const processInputData = (rawInput) => {
    const inputLines = rawInput.split('\n');

    const [gridRows, gridCols] = inputLines[0].split(' ').map(numStr => parseInt(numStr, 10));

    const terrainMap = [];
    for (let currentLineIdx = 0; currentLineIdx < gridRows; currentLineIdx++) {
        terrainMap.push(inputLines[currentLineIdx + 1].split(''));
    }

    const emptyCellPositions = [];
    const cellToIndexMap = makeMatrix({ dimensionsX: gridRows, dimensionsY: gridCols, initialValue: -1 });

    for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
            if (terrainMap[r][c] === '.') {
                const newIndex = emptyCellPositions.length;
                emptyCellPositions.push(createGridPoint(r, c));
                cellToIndexMap[r][c] = newIndex;
            }
        }
    }

    const nodeCount = emptyCellPositions.length;

    const adjMatrix = makeMatrix({ dimensionsX: nodeCount, dimensionsY: nodeCount, initialValue: limitlessValue });

    for (let i = 0; i < nodeCount; i++) {
        adjMatrix[i][i] = 0;

        const { r: sourceR, c: sourceC } = emptyCellPositions[i];

        for (let directionIndex = 0; directionIndex < 4; directionIndex++) {
            const nextR = sourceR + rowAlterations[directionIndex];
            const nextC = sourceC + colAlterations[directionIndex];

            if (nextR >= 0 && nextR < gridRows && nextC >= 0 && nextC < gridCols && terrainMap[nextR][nextC] === '.') {
                const neighborIndex = cellToIndexMap[nextR][nextC];
                adjMatrix[i][neighborIndex] = 1;
            }
        }
    }

    for (let intermediateNode = 0; intermediateNode < nodeCount; intermediateNode++) {
        for (let sourceNode = 0; sourceNode < nodeCount; sourceNode++) {
            for (let destinationNode = 0; destinationNode < nodeCount; destinationNode++) {
                if (adjMatrix[sourceNode][intermediateNode] !== limitlessValue &&
                    adjMatrix[intermediateNode][destinationNode] !== limitlessValue) {
                    const pathThroughIntermediate = adjMatrix[sourceNode][intermediateNode] + adjMatrix[intermediateNode][destinationNode];
                    if (pathThroughIntermediate < adjMatrix[sourceNode][destinationNode]) {
                        adjMatrix[sourceNode][destinationNode] = pathThroughIntermediate;
                    }
                }
            }
        }
    }

    let peakJourneyLength = 0;
    for (let sourceNode = 0; sourceNode < nodeCount; sourceNode++) {
        for (let destinationNode = 0; destinationNode < nodeCount; destinationNode++) {
            if (adjMatrix[sourceNode][destinationNode] !== limitlessValue) {
                peakJourneyLength = Math.max(peakJourneyLength, adjMatrix[sourceNode][destinationNode]);
            }
        }
    }

    console.log(peakJourneyLength);
};

processInputData(filesystemHandler.readFileSync('/dev/stdin', 'utf8'));