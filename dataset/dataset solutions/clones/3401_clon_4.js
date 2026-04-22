const dataAcquisitionSystem = (function() {
    function coreProcessor(inputString) {
        const lineBuffer = inputString.trim().split("\n");
        let currentLinePointer = 0;
        let activeTokenQueue = [];

        const replenishTokens = () => {
            if (activeTokenQueue.length === 0 && currentLinePointer < lineBuffer.length) {
                activeTokenQueue = lineBuffer[currentLinePointer].split(" ").reverse();
                currentLinePointer++;
            }
        };

        return {
            retrieveUnit: (isText) => {
                replenishTokens();
                if (activeTokenQueue.length > 0) {
                    const token = activeTokenQueue.shift();
                    return isText ? token : Number(token);
                }
                return null;
            },
            scanSequence: (isText) => {
                if (currentLinePointer < lineBuffer.length) {
                    activeTokenQueue = [];
                    const sequence = lineBuffer[currentLinePointer].split(" ");
                    currentLinePointer++;
                    return isText ? sequence : sequence.map(Number);
                }
                return [];
            },
            readBlock: (rowCount, isText) => {
                const blockData = [];
                for (let i = 0; i < rowCount; i++) {
                    if (currentLinePointer < lineBuffer.length) {
                        activeTokenQueue = [];
                        const row = lineBuffer[currentLinePointer].split(" ");
                        blockData.push(isText ? row : row.map(Number));
                        currentLinePointer++;
                    }
                }
                return blockData;
            },
            fetchSegment: (itemCount, isText) => {
                const segmentData = [];
                for (let i = 0; i < itemCount; i++) {
                    if (currentLinePointer < lineBuffer.length) {
                        activeTokenQueue = [];
                        const item = lineBuffer[currentLinePointer];
                        segmentData.push(isText ? item : Number(item));
                        currentLinePointer++;
                    }
                }
                return segmentData;
            }
        };
    }
    return coreProcessor;
})();

const sourceData = dataAcquisitionSystem(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(computeSolution());

function computeSolution() {
    const verticalExtent = sourceData.retrieveUnit();
    const horizontalExtent = sourceData.retrieveUnit();
    const obstructionCount = sourceData.retrieveUnit();

    const blockedCoordinates = new Set();

    for (let currentObstacleIndex = 0; currentObstacleIndex < obstructionCount; currentObstacleIndex++) {
        const obstacleEntry = sourceData.scanSequence();
        const obstacleColumn = obstacleEntry[0];
        const obstacleRow = obstacleEntry[1];

        if (obstacleColumn >= obstacleRow) {
            blockedCoordinates.add(`${obstacleRow},${obstacleColumn}`);
        }
    }

    for (let rowIdx = 1; rowIdx <= verticalExtent; rowIdx++) {
        blockedCoordinates.add(`${rowIdx},${horizontalExtent + 1}`);
    }

    let pathBoundary = horizontalExtent;
    for (let checkCol = 1; checkCol <= horizontalExtent + 1; checkCol++) {
        if (blockedCoordinates.has(`1,${checkCol}`)) {
            pathBoundary = checkCol - 1;
            break;
        }
    }

    let currentPathwayRow = 2;
    let currentTraversalColumn = 2;

    while (currentPathwayRow <= pathBoundary && currentPathwayRow <= verticalExtent) {
        while (blockedCoordinates.has(`${currentPathwayRow},${currentTraversalColumn}`)) {
            currentTraversalColumn++;
        }

        let immediateBlocker = horizontalExtent + 1;
        for (let testCol = currentTraversalColumn + 1; testCol <= horizontalExtent + 1; testCol++) {
            if (blockedCoordinates.has(`${currentPathwayRow},${testCol}`)) {
                immediateBlocker = testCol;
                break;
            }
        }

        if (immediateBlocker - 1 < pathBoundary) {
            pathBoundary = immediateBlocker - 1;
        }

        currentTraversalColumn++;

        if (currentTraversalColumn > horizontalExtent) {
            break;
        }

        currentPathwayRow++;
    }

    return pathBoundary;
}