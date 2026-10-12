'use strict';

const extractDimensions = (dimString) => {
    const parts = dimString.split(' ').map(s => parseInt(s, 10));
    const [hVal, wVal] = parts;
    return { height: hVal, width: wVal };
};

const createMatrix = (rows, cols, initialValue = 0) => {
    return Array.from({ length: rows }, () => Array(cols).fill(initialValue));
};

function processInput(rawData) {
    const inputLines = rawData.split('\n');

    const { height, width } = extractDimensions(inputLines.shift());

    const gridMap = [];
    for (let r = 0; r < height; r++) {
        gridMap.push(inputLines.shift().split(''));
    }

    const moduloConstant = 1_000_000_007;

    const pathCounts = createMatrix(height, width, 0);

    pathCounts[0][0] = 1;

    for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
            if (gridMap[r][c] === '#') {
                continue;
            }

            if (r === 0 && c === 0) {
                continue;
            }

            let currentCellPathsAccumulator = 0;

            if (r > 0 && gridMap[r - 1][c] !== '#') {
                currentCellPathsAccumulator = (currentCellPathsAccumulator + pathCounts[r - 1][c]) % moduloConstant;
            }

            if (c > 0 && gridMap[r][c - 1] !== '#') {
                currentCellPathsAccumulator = (currentCellPathsAccumulator + pathCounts[r][c - 1]) % moduloConstant;
            }
            
            pathCounts[r][c] = currentCellPathsAccumulator;
        }
    }

    const finalPathCount = pathCounts[height - 1][width - 1];
    console.log(finalPathCount);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
