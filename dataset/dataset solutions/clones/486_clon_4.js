const journeyInitiator = (gridDimension, terrainLayout) => {
    const exploredLocations = new Set();
    let expeditionQueue = [
        [0, 0, 0],
        [1, 0, 0]
    ];
    let finalOutcome = "NA";

    while (expeditionQueue.length > 0) {
        const currentPoint = expeditionQueue.shift();
        const currentLane = currentPoint[0];
        let currentColumn = currentPoint[1];
        const currentDepth = currentPoint[2];

        const pointKey = `${currentLane},${currentColumn}`;

        if (exploredLocations.has(pointKey)) {
            continue;
        }
        exploredLocations.add(pointKey);

        if (currentColumn === gridDimension - 1 && terrainLayout[currentLane][currentColumn] !== 2) {
            finalOutcome = currentDepth;
            break;
        }

        const cellMark = terrainLayout[currentLane][currentColumn];

        if (cellMark === 1) {
            let reachedBoundary = false;
            let tempColumn = currentColumn;
            while (true) {
                tempColumn++;
                if (tempColumn >= gridDimension - 1) {
                    reachedBoundary = true;
                    break;
                }
                if (terrainLayout[currentLane][tempColumn] !== 1) {
                    tempColumn--;
                    break;
                }
            }
            currentColumn = tempColumn;
            if (reachedBoundary) {
                finalOutcome = currentDepth;
                break;
            }
        } else if (cellMark === 2) {
            let tempColumn = currentColumn;
            while (true) {
                tempColumn--;
                if (terrainLayout[currentLane][tempColumn] !== 2) {
                    break;
                }
            }
            currentColumn = tempColumn;
        }

        for (let offset = 0; offset <= 2; offset++) {
            const nextLane = 1 - currentLane;
            const nextColumn = currentColumn + offset;
            const nextDepth = currentDepth + 1;

            if (nextColumn < gridDimension) {
                expeditionQueue.push([nextLane, nextColumn, nextDepth]);
            }
        }
    }
    return finalOutcome;
};

const processInputData = (rawData) => {
    const parsedLines = rawData.trim().split("\n");
    let lineIndex = 0;
    const results = [];

    const handleNextCase = () => {
        if (lineIndex >= parsedLines.length) {
            return;
        }

        const currentSize = parseInt(parsedLines[lineIndex++], 10);
        if (currentSize === 0) {
            return;
        }

        const gridMatrix = [];
        gridMatrix[0] = parsedLines[lineIndex++].split(" ").map(Number);
        gridMatrix[1] = parsedLines[lineIndex++].split(" ").map(Number);

        results.push(journeyInitiator(currentSize, gridMatrix));

        handleNextCase();
    };

    handleNextCase();
    return results;
};

const fileSystemAccess = require('fs');
const rawInputContent = fileSystemAccess.readFileSync('/dev/stdin', 'utf8');
const computedOutcomes = processInputData(rawInputContent);
computedOutcomes.forEach(outcome => console.log(outcome));