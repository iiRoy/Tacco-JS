const MOD_CONST = 1000000007;

function processPaths(sourceText) {
    const allLines = sourceText.trim().split('\n');
    const sizeInfo = allLines[0].split(' ').map(Number);
    const numRows = sizeInfo[0];
    const numCols = sizeInfo[1];

    const gridMap = [];
    for (let currentY = 1; currentY <= numRows; currentY++) {
        gridMap.push(allLines[currentY].split(''));
    }

    const memoizationTable = new Map();

    function findPaths(rowIdx, colIdx) {
        if (rowIdx >= numRows || colIdx >= numCols || gridMap[rowIdx][colIdx] === '#') {
            return 0;
        }

        if (rowIdx === numRows - 1 && colIdx === numCols - 1) {
            return 1;
        }

        const cacheKey = `${rowIdx},${colIdx}`;
        if (memoizationTable.has(cacheKey)) {
            return memoizationTable.get(cacheKey);
        }

        const pathsFromDown = findPaths(rowIdx + 1, colIdx);
        const pathsFromRight = findPaths(rowIdx, colIdx + 1);

        const totalPaths = (pathsFromDown + pathsFromRight) % MOD_CONST;

        memoizationTable.set(cacheKey, totalPaths);
        return totalPaths;
    }

    const finalCount = findPaths(0, 0);
    console.log(finalCount);
}

processPaths(require("fs").readFileSync("/dev/stdin", "utf8"));