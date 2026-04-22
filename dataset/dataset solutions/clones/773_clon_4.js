let allInputData = '';

process.stdin.on('data', (inputChunk) => {
    allInputData += inputChunk.toString();
});

process.stdin.on('end', () => {
    const processGraphCalculations = (completeRawData) => {
        const dataLines = completeRawData.trim().split('\n');

        const [totalNodes, totalEdges, initialPosition, firstObjective, secondObjective] = dataLines.shift().split(' ').map(Number);

        const initialPoint = initialPosition - 1;
        const firstGoal = firstObjective - 1;
        const secondGoal = secondObjective - 1;

        const distanceMatrix = Array.from({ length: totalNodes }, (_, rowIndex) =>
            Array.from({ length: totalNodes }, (_, colIndex) =>
                rowIndex === colIndex ? 0 : Number.POSITIVE_INFINITY
            )
        );

        dataLines.slice(0, totalEdges).forEach(edgeDescription => {
            const [originNode, destinationNode, connectionWeight] = edgeDescription.split(' ').map(Number);
            distanceMatrix[originNode - 1][destinationNode - 1] = connectionWeight;
        });

        Array.from({ length: totalNodes }, (_, intermediateVertex) => intermediateVertex).forEach(viaVertex => {
            Array.from({ length: totalNodes }, (_, startVertex) => startVertex).forEach(fromVertex => {
                Array.from({ length: totalNodes }, (_, endVertex) => endVertex).forEach(toVertex => {
                    distanceMatrix[fromVertex][toVertex] = Math.min(
                        distanceMatrix[fromVertex][toVertex],
                        distanceMatrix[fromVertex][viaVertex] + distanceMatrix[viaVertex][toVertex]
                    );
                });
            });
        });

        let overallMinimumPath = Number.POSITIVE_INFINITY;
        Array.from({ length: totalNodes }, (_, potentialCrossing) => potentialCrossing).forEach(crossingPoint => {
            const currentPathSum =
                distanceMatrix[initialPoint][crossingPoint] +
                distanceMatrix[crossingPoint][firstGoal] +
                distanceMatrix[crossingPoint][secondGoal];
            overallMinimumPath = Math.min(overallMinimumPath, currentPathSum);
        });

        console.log(overallMinimumPath);
    };

    processGraphCalculations(allInputData);
});