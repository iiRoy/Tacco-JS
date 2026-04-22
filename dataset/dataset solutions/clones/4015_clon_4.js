(function() {
    const extractNumbers = (textLine) => textLine.split(' ').map(Number);

    const inputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    const textLines = inputContent.trim().split('\n');

    const [gridHeightDim, gridWidthDim, distanceStep] = extractNumbers(textLines[0]);
    const gridRows = textLines.slice(1, gridHeightDim + 1).map(extractNumbers);

    const cellCoordinates = gridRows.reduce((accMap, currentRow, rIndex) => {
        currentRow.forEach((cellValue, cIndex) => accMap.set(cellValue, [rIndex, cIndex]));
        return accMap;
    }, new Map());

    const totalCellsCount = gridHeightDim * gridWidthDim;
    const memoizedCosts = new Map();

    const getCostRecursive = (targetCellId) => {
        if (targetCellId <= distanceStep) {
            return 0;
        }

        if (memoizedCosts.has(targetCellId)) {
            return memoizedCosts.get(targetCellId);
        }

        const prevCellId = targetCellId - distanceStep;
        
        const coordA = cellCoordinates.get(targetCellId);
        const coordB = cellCoordinates.get(prevCellId);

        const manhattanDist = Math.abs(coordA[0] - coordB[0]) + Math.abs(coordA[1] - coordB[1]);

        const currentAccumulatedCost = manhattanDist + getCostRecursive(prevCellId);
        memoizedCosts.set(targetCellId, currentAccumulatedCost);
        return currentAccumulatedCost;
    };

    for (let currentCellId = 1; currentCellId <= totalCellsCount; currentCellId++) {
        getCostRecursive(currentCellId);
    }

    const queryCountLine = extractNumbers(textLines[gridHeightDim + 1]);
    const queryCount = queryCountLine[0];
    const queryDetails = textLines.slice(gridHeightDim + 2, gridHeightDim + 2 + queryCount).map(extractNumbers);

    const queryResults = queryDetails.map(([leftBound, rightBound]) => {
        return memoizedCosts.get(rightBound) - memoizedCosts.get(leftBound);
    });

    console.log(queryResults.join('\n'));
})();