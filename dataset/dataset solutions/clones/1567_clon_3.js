function parseNumbersFromString(str, delimitor = ' ') {
    return str.split(delimitor).map(s => parseInt(s, 10));
}

function parseBigIntsFromString(str, delimitor = ' ') {
    return str.split(delimitor).map(s => BigInt(s));
}

function createMatrixFromStringArray(array, delimitor = ' ') {
    const result = array.map(v => v.split(delimitor));
    return result;
}

function calculateSum(n) {
    return n.reduce((a, b) => a + b);
}

class PathTraversalState {
    constructor(initialX, initialY, initialMoves) {
        this.currentX = initialX;
        this.currentY = initialY;
        this.movesTaken = initialMoves;
    }
}

function processInput(inputString) {
    const lines = inputString.split("\n");
    const [firstLine, ...remainingLines] = lines;

    const [height, width] = parseNumbersFromString(firstLine);

    const rawSegmentData = createMatrixFromStringArray(remainingLines, ' ');
    const blockedSegments = rawSegmentData.map(segmentRow => segmentRow.map(val => parseInt(val, 10)));

    blockedSegments.unshift(null);

    let minMovesToReachRow = new Array(height).fill(-1);

    const isPathClearBelow = (xCoord, yCoord) => {
        const currentSegment = blockedSegments[yCoord];
        return !(currentSegment[0] <= xCoord && xCoord <= currentSegment[1]);
    };

    for (let startCol = 1; startCol <= width; startCol++) {
        const currentPathState = new PathTraversalState(startCol, 1, 0);

        while (true) {
            currentPathState.movesTaken++;

            if (isPathClearBelow(currentPathState.currentX, currentPathState.currentY)) {
                currentPathState.currentY++;

                const targetRowIndex = currentPathState.currentY - 2;

                if (targetRowIndex >= 0 && targetRowIndex < height) {
                    if (minMovesToReachRow[targetRowIndex] === -1 || currentPathState.movesTaken < minMovesToReachRow[targetRowIndex]) {
                        minMovesToReachRow[targetRowIndex] = currentPathState.movesTaken;
                    }
                }

                if (currentPathState.currentY > height) {
                    break;
                }
            } else {
                currentPathState.currentX++;
                if (currentPathState.currentX > width) {
                    break;
                }
            }
        }
    }

    console.log(minMovesToReachRow.join("\n"));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
