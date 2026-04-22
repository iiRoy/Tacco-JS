const computeSpellTraversal = (rawInputData) => {

    const parseNumericString = (strValue) => {
        return Number.parseInt(strValue.trim(), 10);
    };

    const allInputLines = rawInputData.trim().split('\n');

    const [configLine, ...remainingInputSegments] = allInputLines;
    const [numRows, numColumns, stepDistance] = configLine.split(' ').map(parseNumericString);

    const maxPossibleGridValue = numRows * numColumns;

    const valueCoordinateMap = new Array(maxPossibleGridValue + 1).fill(null);

    const gridDataEndIndex = numRows; // The grid occupies 'numRows' lines

    for (let currentGridRowIndex = 0; currentGridRowIndex < numRows; ++currentGridRowIndex) {
        const currentRowValues = remainingInputSegments[currentGridRowIndex].split(' ').map(parseNumericString);
        for (let currentGridColumnIndex = 0; currentGridColumnIndex < numColumns; ++currentGridColumnIndex) {
            const cellNumericValue = currentRowValues[currentGridColumnIndex];
            valueCoordinateMap[cellNumericValue] = [currentGridRowIndex, currentGridColumnIndex];
        }
    }

    const cumulativePathCosts = new Array(maxPossibleGridValue + 1).fill(0);

    const calculateManhattanDistance = (coordA, coordB) => {
        const [rowA, colA] = coordA;
        const [rowB, colB] = coordB;
        return Math.abs(rowA - rowB) + Math.abs(colA - colB);
    };

    for (let startingOffset = 1; startingOffset <= stepDistance; ++startingOffset) {
        for (let currentPathNode = startingOffset; currentPathNode <= maxPossibleGridValue - stepDistance; currentPathNode += stepDistance) {
            const nextPathNode = currentPathNode + stepDistance;

            if (valueCoordinateMap[currentPathNode] && valueCoordinateMap[nextPathNode]) {
                const segmentDistance = calculateManhattanDistance(
                    valueCoordinateMap[currentPathNode],
                    valueCoordinateMap[nextPathNode]
                );
                cumulativePathCosts[nextPathNode] = cumulativePathCosts[currentPathNode] + segmentDistance;
            }
        }
    }

    const numberOfQueriesLineIndex = gridDataEndIndex;
    const totalQueries = parseNumericString(remainingInputSegments[numberOfQueriesLineIndex].split(' ')[0]);

    const queryDataStartLine = gridDataEndIndex + 1;
    const queryInstructions = remainingInputSegments.slice(queryDataStartLine, queryDataStartLine + totalQueries);

    const computedQueryOutcomes = [];

    for (let queryIterator = 0; queryIterator < totalQueries; ++queryIterator) {
        const [queryStartPoint, queryEndPoint] = queryInstructions[queryIterator].split(' ').map(parseNumericString);

        if (queryStartPoint < 1 || queryStartPoint > maxPossibleGridValue ||
            queryEndPoint < 1 || queryEndPoint > maxPossibleGridValue) {
            // In a real-world scenario, robust error handling or a default value might be pushed.
            // For competitive programming, input is usually guaranteed valid.
            computedQueryOutcomes.push(0); // Or throw an error
            continue;
        }

        const currentQueryCalculatedCost = cumulativePathCosts[queryEndPoint] - cumulativePathCosts[queryStartPoint];
        computedQueryOutcomes.push(currentQueryCalculatedCost);
    }

    return computedQueryOutcomes.join('\n');
};

const systemInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(computeSpellTraversal(systemInputContent));