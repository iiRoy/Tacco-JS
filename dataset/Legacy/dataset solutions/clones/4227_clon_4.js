function processInputData(rawData) {
    const lines = rawData.split("\n");

    const dimensionsLine = lines[0].split(" ");
    const gridHeight = Number(dimensionsLine[0]);
    const gridWidth = Number(dimensionsLine[1]);

    const conversionCosts = Array.from({ length: 10 }, (_, rowIdx) =>
        lines[rowIdx + 1].split(" ").map(Number)
    );

    const digitOccurrences = Array(10).fill(0);
    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        const gridRowValues = lines[rowIdx + 1 + 10].split(" ").map(Number);
        for (const digitValue of gridRowValues) {
            if (digitValue >= 0) {
                digitOccurrences[digitValue]++;
            }
        }
    }

    const findMinCostPath = (sourceNode, destinationNode, costsMatrix) => {
        const nodeCount = costsMatrix.length;
        const currentShortestDistances = Array(nodeCount).fill(Infinity);
        const processedNodes = Array(nodeCount).fill(false);
        currentShortestDistances[sourceNode] = 0;

        let distanceQueue = [[0, sourceNode]];

        while (distanceQueue.length > 0) {
            let minimumCurrentDistance = Infinity;
            let minimumNodeIdentifier = -1;
            let queueEntryIndex = -1;

            for (let k = 0; k < distanceQueue.length; k++) {
                if (distanceQueue[k][0] < minimumCurrentDistance) {
                    minimumCurrentDistance = distanceQueue[k][0];
                    minimumNodeIdentifier = distanceQueue[k][1];
                    queueEntryIndex = k;
                }
            }

            if (minimumNodeIdentifier === -1) break;

            distanceQueue.splice(queueEntryIndex, 1);

            if (processedNodes[minimumNodeIdentifier]) {
                continue;
            }
            processedNodes[minimumNodeIdentifier] = true;

            if (minimumNodeIdentifier === destinationNode) {
                return currentShortestDistances[destinationNode];
            }

            for (let adjacentNode = 0; adjacentNode < nodeCount; adjacentNode++) {
                if (!processedNodes[adjacentNode]) {
                    const edgeWeight = costsMatrix[minimumNodeIdentifier][adjacentNode];
                    const candidateNewDistance = currentShortestDistances[minimumNodeIdentifier] + edgeWeight;
                    if (candidateNewDistance < currentShortestDistances[adjacentNode]) {
                        currentShortestDistances[adjacentNode] = candidateNewDistance;
                        distanceQueue.push([candidateNewDistance, adjacentNode]);
                    }
                }
            }
        }
        return currentShortestDistances[destinationNode];
    };

    let totalConversionCost = 0;
    const targetDigitValue = 1;

    for (let currentSourceDigit = 0; currentSourceDigit < 10; currentSourceDigit++) {
        if (digitOccurrences[currentSourceDigit] > 0 && currentSourceDigit !== targetDigitValue) {
            const costToTarget = findMinCostPath(currentSourceDigit, targetDigitValue, conversionCosts);
            totalConversionCost += costToTarget * digitOccurrences[currentSourceDigit];
        }
    }

    console.log('%s', totalConversionCost);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
