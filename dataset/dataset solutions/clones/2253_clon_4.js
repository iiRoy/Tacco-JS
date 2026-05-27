"use strict";
const createInputProcessor = (rawContent) => {
    const lineSegments = rawContent.trim().split("\n");
    let currentLineIndex = 0;
    let currentLineTokens = [];

    const ensureTokens = () => {
        if (currentLineTokens.length === 0 && currentLineIndex < lineSegments.length) {
            currentLineTokens = lineSegments[currentLineIndex++].split(" ");
        }
    };

    return {
        fetchNextValue: (asString = false) => {
            ensureTokens();
            const token = currentLineTokens.shift();
            return asString ? token : Number(token);
        },
        fetchLineValues: (asStrings = false) => {
            if (currentLineIndex >= lineSegments.length) return [];
            const line = lineSegments[currentLineIndex++];
            return asStrings ? line.split(" ") : line.split(" ").map(Number);
        },
        fetchMatrix: (rowCount, asStrings = false) => {
            const matrix = [];
            for (let i = 0; i < rowCount; i++) {
                if (currentLineIndex >= lineSegments.length) break;
                const line = lineSegments[currentLineIndex++];
                matrix.push(asStrings ? line.split(" ") : line.split(" ").map(Number));
            }
            return matrix;
        },
        fetchRowsAsStrings: (rowCount) => {
            const rows = [];
            for (let i = 0; i < rowCount; i++) {
                if (currentLineIndex >= lineSegments.length) break;
                rows.push(lineSegments[currentLineIndex++]);
            }
            return rows;
        }
    };
};

const initializeGrid = (rows, cols, initialVal) => {
    return Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => initialVal)
    );
};

const processGridPathfinding = () => {
    const inputSource = createInputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

    const gridRows = inputSource.fetchNextValue();
    const gridCols = inputSource.fetchNextValue();
    const gridData = inputSource.fetchRowsAsStrings(gridRows);

    let overallMaxDistance = 0;

    for (let rIdx = 0; rIdx < gridRows; rIdx++) {
        for (let cIdx = 0; cIdx < gridCols; cIdx++) {
            if (gridData[rIdx][cIdx] === ".") {
                const currentDistances = calculateDistancesFromStart(rIdx, cIdx, gridRows, gridCols, gridData);
                
                for (let i = 0; i < gridRows; i++) {
                    for (let j = 0; j < gridCols; j++) {
                        if (currentDistances[i][j] > overallMaxDistance) {
                            overallMaxDistance = currentDistances[i][j];
                        }
                    }
                }
            }
        }
    }
    return overallMaxDistance;
};

const calculateDistancesFromStart = (startR, startC, totalRows, totalCols, terrainMap) => {
    const distanceMap = initializeGrid(totalRows, totalCols, -1);
    distanceMap[startR][startC] = 0;

    const traversalQueue = [{ r: startR, c: startC }];
    let queuePointer = 0;

    const rowOffsets = [-1, 1, 0, 0];
    const colOffsets = [0, 0, -1, 1];

    let currentLevelDistance = 0;

    while (queuePointer < traversalQueue.length) {
        const levelSize = traversalQueue.length - queuePointer;
        
        for (let i = 0; i < levelSize; i++) {
            const { r, c } = traversalQueue[queuePointer++];

            for (let k = 0; k < 4; k++) {
                const nextR = r + rowOffsets[k];
                const nextC = c + colOffsets[k];

                if (nextR >= 0 && nextR < totalRows && nextC >= 0 && nextC < totalCols) {
                    if (terrainMap[nextR][nextC] === "." && distanceMap[nextR][nextC] === -1) {
                        distanceMap[nextR][nextC] = currentLevelDistance + 1;
                        traversalQueue.push({ r: nextR, c: nextC });
                    }
                }
            }
        }
        currentLevelDistance++;
    }
    return distanceMap;
};

console.log(processGridPathfinding());
