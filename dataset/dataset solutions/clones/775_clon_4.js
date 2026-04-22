const retrieveSystemInput = () => new Promise(resolve => {
    let garneredText = '';
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', inputFragment => {
        garneredText += inputFragment;
    });
    process.stdin.on('end', () => {
        resolve(garneredText.split('\n'));
    });
});

const commenceAnalysis = (processedLines) => {
    const [vertexCount, edgeCount, startPoint, destinationA, destinationB] = processedLines[0].split(' ').map(Number);

    const adjustedStartPoint = startPoint - 1;
    const adjustedDestinationA = destinationA - 1;
    const adjustedDestinationB = destinationB - 1;

    let shortestPathMatrix = Array.from({ length: vertexCount }, (_, sourceIdx) =>
        Array.from({ length: vertexCount }, (_, targetIdx) =>
            sourceIdx === targetIdx ? 0 : Number.POSITIVE_INFINITY
        )
    );

    processedLines.slice(1, 1 + edgeCount).forEach(connectionDescription => {
        const [originVertex, terminalVertex, edgeWeight] = connectionDescription.split(' ').map(Number);
        shortestPathMatrix[originVertex - 1][terminalVertex - 1] = edgeWeight;
    });

    Array.from({ length: vertexCount }, (_, viaNode) => {
        Array.from({ length: vertexCount }, (_, initialNode) => {
            Array.from({ length: vertexCount }, (_, finalNode) => {
                const existingPathCost = shortestPathMatrix[initialNode][finalNode];
                const alternativePathCost = shortestPathMatrix[initialNode][viaNode] + shortestPathMatrix[viaNode][finalNode];
                shortestPathMatrix[initialNode][finalNode] = Math.min(existingPathCost, alternativePathCost);
            });
        });
    });

    let overallMinimumCost = Number.POSITIVE_INFINITY;

    Array.from({ length: vertexCount }, (_, pathTraversalNode) => {
        const currentTotalPath =
            shortestPathMatrix[adjustedStartPoint][pathTraversalNode] +
            shortestPathMatrix[pathTraversalNode][adjustedDestinationA] +
            shortestPathMatrix[pathTraversalNode][adjustedDestinationB];
        overallMinimumCost = Math.min(overallMinimumCost, currentTotalPath);
    });

    console.log(overallMinimumCost);
};

retrieveSystemInput().then(commenceAnalysis);