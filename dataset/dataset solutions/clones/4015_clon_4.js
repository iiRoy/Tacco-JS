((inputString) => {
    const lineSegments = inputString.trim().split('\n');

    const [dimensionSpec, ...remainingSegments] = lineSegments;
    const [gridRows, gridCols, stepDistance] = dimensionSpec.split(' ').map(Number);

    const totalGridElements = gridRows * gridCols;

    const gridLayoutData = remainingSegments.slice(0, gridRows).map(segment => segment.split(' ').map(Number));
    const queryCountLine = remainingSegments[gridRows];
    const numberOfQueries = Number(queryCountLine.split(' ')[0]);
    const queryRequests = remainingSegments.slice(gridRows + 1, gridRows + 1 + numberOfQueries).map(segment => segment.split(' ').map(Number));

    const elementLocations = new Map(); // Stores {value: {r: row, c: col}}
    for (let currentR = 0; currentR < gridRows; currentR++) {
        for (let currentC = 0; currentC < gridCols; currentC++) {
            elementLocations.set(gridLayoutData[currentR][currentC], { r: currentR, c: currentC });
        }
    }

    const cumulativePathCosts = new Map(); // Stores {value: cumulative_cost_from_sequence_start}
    
    for (let sequenceStartValue = 1; sequenceStartValue <= stepDistance; sequenceStartValue++) {
        let currentPathNode = sequenceStartValue;
        let currentSequenceCost = 0;
        cumulativePathCosts.set(currentPathNode, currentSequenceCost);

        while (currentPathNode + stepDistance <= totalGridElements) {
            const nextPathNode = currentPathNode + stepDistance;
            
            const currentCoords = elementLocations.get(currentPathNode);
            const nextCoords = elementLocations.get(nextPathNode);

            const segmentManhattanDistance = Math.abs(currentCoords.r - nextCoords.r) + Math.abs(currentCoords.c - nextCoords.c);
            
            currentSequenceCost += segmentManhattanDistance;
            cumulativePathCosts.set(nextPathNode, currentSequenceCost);
            
            currentPathNode = nextPathNode;
        }
    }

    const queryResults = queryRequests.map(([startNode, endNode]) => {
        const endNodeCost = cumulativePathCosts.get(endNode);
        const startNodeCost = cumulativePathCosts.get(startNode);
        return endNodeCost - startNodeCost;
    });

    return queryResults.join('\n');

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
