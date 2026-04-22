const processGridTransformation = (sourceText) => {
    const dataBlocks = sourceText.split('\n');

    const dimensions = dataBlocks[0].split(' ').map(token => parseInt(token, 10));
    const gridRows = dimensions[0];
    const gridCols = dimensions[1];

    const INFINITE_DISTANCE = Number.MAX_SAFE_INTEGER;

    let propagationGrid = Array.from({ length: gridRows }, () =>
        Array.from({ length: gridCols }, () => INFINITE_DISTANCE)
    );

    let propagationQueue = [];
    let longestPropagationPath = -1;

    for (let r = 0; r < gridRows; ++r) {
        const rowContent = dataBlocks[r + 1];
        for (let c = 0; c < gridCols; ++c) {
            if (rowContent[c] === '#') {
                propagationGrid[r][c] = 0;
                propagationQueue.push([r, c]);
                longestPropagationPath = Math.max(longestPropagationPath, 0);
            }
        }
    }

    const adjacencyVectors = [
        [-1, 0], // North
        [1, 0],  // South
        [0, -1], // West
        [0, 1]   // East
    ];

    let currentQueuePointer = 0;
    while (currentQueuePointer < propagationQueue.length) {
        const currentCoordinates = propagationQueue[currentQueuePointer++];
        const currentR = currentCoordinates[0];
        const currentC = currentCoordinates[1];
        const currentPathLength = propagationGrid[currentR][currentC];

        for (const [dr, dc] of adjacencyVectors) {
            const nextR = currentR + dr;
            const nextC = currentC + dc;

            if (nextR >= 0 && nextR < gridRows && nextC >= 0 && nextC < gridCols) {
                if (propagationGrid[nextR][nextC] === INFINITE_DISTANCE) {
                    const newPathLength = currentPathLength + 1;
                    propagationGrid[nextR][nextC] = newPathLength;
                    propagationQueue.push([nextR, nextC]);
                    longestPropagationPath = Math.max(longestPropagationPath, newPathLength);
                }
            }
        }
    }

    return longestPropagationPath;
};

const systemInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
const computedResult = processGridTransformation(systemInputContent);
console.log(computedResult);