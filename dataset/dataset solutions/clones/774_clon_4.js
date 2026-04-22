let receivedData = '';
process.stdin.on('data', (segment) => { receivedData += segment; });
process.stdin.on('end', () => {
    const rawInputLines = receivedData.trim().split('\n');

    const configureDetails = rawInputLines[0].split(' ').map(Number);
    const nodeQuantity = configureDetails[0];
    const edgeQuantity = configureDetails[1];
    const commencementPoint = configureDetails[2] - 1;
    const firstObjective = configureDetails[3] - 1;
    const secondObjective = configureDetails[4] - 1;

    const distanceGrid = Array.from({ length: nodeQuantity }, (_, originIndex) =>
        Array.from({ length: nodeQuantity }, (_, destinationIndex) =>
            originIndex === destinationIndex ? 0 : Number.POSITIVE_INFINITY
        )
    );

    rawInputLines.slice(1, 1 + edgeQuantity).forEach(connectionDescriptor => {
        const [startNode, endNode, connectionWeight] = connectionDescriptor.split(' ').map(Number);
        distanceGrid[startNode - 1][endNode - 1] = connectionWeight;
    });

    const calculatePathUpdates = (currentGridState, passThroughIndex) => {
        return Array.from({ length: nodeQuantity }, (_, originIndex) =>
            Array.from({ length: nodeQuantity }, (_, destinationIndex) => {
                const directPath = currentGridState[originIndex][destinationIndex];
                const pathViaIntermediate = currentGridState[originIndex][passThroughIndex] + currentGridState[passThroughIndex][destinationIndex];
                return Math.min(directPath, pathViaIntermediate);
            })
        );
    };

    let finalDistanceMap = distanceGrid;
    for (let passThroughIndex = 0; passThroughIndex < nodeQuantity; ++passThroughIndex) {
        finalDistanceMap = calculatePathUpdates(finalDistanceMap, passThroughIndex);
    }

    const allPossibleMidpoints = Array.from({ length: nodeQuantity }, (_, pointIndex) => pointIndex);
    const minimalRouteCost = allPossibleMidpoints.reduce((minimumOverallCost, currentMidpoint) => {
        const segment1Cost = finalDistanceMap[commencementPoint][currentMidpoint];
        const segment2Cost = finalDistanceMap[currentMidpoint][firstObjective];
        const segment3Cost = finalDistanceMap[currentMidpoint][secondObjective];
        const totalCurrentPathCost = segment1Cost + segment2Cost + segment3Cost;
        return Math.min(minimumOverallCost, totalCurrentPathCost);
    }, Number.POSITIVE_INFINITY);

    process.stdout.write(minimalRouteCost.toString() + '\n');
});

process.stdin.resume();