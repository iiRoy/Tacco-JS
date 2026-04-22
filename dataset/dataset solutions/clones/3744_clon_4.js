function processInputAndDetermineStructure(rawInput) {
    const parseGraphInput = (textSegment) => {
        const lines = textSegment.trim().split('\n');
        const [nodeQuantity, connectionCount] = lines[0].split(' ').map(Number);

        const linkNetwork = new Map();
        for (let i = 0; i < nodeQuantity; i++) {
            linkNetwork.set(i, new Set());
        }

        for (let i = 1; i <= connectionCount; i++) {
            const [pointAlpha, pointBeta] = lines[i].split(' ').map(val => parseInt(val, 10));
            linkNetwork.get(pointAlpha).add(pointBeta);
            linkNetwork.get(pointBeta).add(pointAlpha);
        }
        return {
            overallPoints: nodeQuantity,
            overallConnections: connectionCount,
            pointLinks: linkNetwork
        };
    };

    const findOptimalPoint = (graphDetails) => {
        const { overallPoints, pointLinks } = graphDetails;
        let minimumDegreeValue = Number.MAX_SAFE_INTEGER;
        let designatedPoint = -1;

        for (let i = 0; i < overallPoints; i++) {
            const currentPointDegree = pointLinks.get(i).size;
            if (currentPointDegree < minimumDegreeValue) {
                minimumDegreeValue = currentPointDegree;
                designatedPoint = i;
            }
        }
        return {
            lowestDegree: minimumDegreeValue,
            pivotPoint: designatedPoint
        };
    };

    const verifySubgroupConnectivity = (subgroupPoints, allPointLinks) => {
        if (subgroupPoints.length <= 1) {
            return true;
        }
        for (let i = 0; i < subgroupPoints.length; i++) {
            const referencePoint = subgroupPoints[i];
            const referencePointNeighbors = allPointLinks.get(referencePoint);
            for (let j = i + 1; j < subgroupPoints.length; j++) {
                const comparisonPoint = subgroupPoints[j];
                if (!referencePointNeighbors.has(comparisonPoint)) {
                    return false;
                }
            }
        }
        return true;
    };

    const analyzeStructureAndCalculate = (graphDetails, optimalPointInfo) => {
        const { overallPoints, pointLinks } = graphDetails;
        const { lowestDegree, pivotPoint } = optimalPointInfo;

        const firstPartition = []; // Neighbors of pivotPoint
        const secondPartition = []; // Non-neighbors of pivotPoint

        const allAvailablePoints = Array.from({ length: overallPoints }, (_, idx) => idx);
        const neighborsOfDesignated = pointLinks.get(pivotPoint);

        for (const currentPoint of allAvailablePoints) {
            if (currentPoint === pivotPoint) {
                continue;
            }
            if (neighborsOfDesignated.has(currentPoint)) {
                firstPartition.push(currentPoint);
            } else {
                secondPartition.push(currentPoint);
            }
        }

        if (!verifySubgroupConnectivity(firstPartition, pointLinks) || !verifySubgroupConnectivity(secondPartition, pointLinks)) {
            return -1;
        }

        const edgesInFirstClique = lowestDegree * (lowestDegree + 1) / 2;
        const sizeOfSecondClique = overallPoints - lowestDegree - 1;
        const edgesInSecondClique = sizeOfSecondClique * (sizeOfSecondClique - 1) / 2;

        return edgesInFirstClique + edgesInSecondClique;
    };

    const graphData = parseGraphInput(rawInput);
    const minPointDetails = findOptimalPoint(graphData);
    const finalOutcome = analyzeStructureAndCalculate(graphData, minPointDetails);
    console.log(finalOutcome);
}
processInputAndDetermineStructure(require("fs").readFileSync("/dev/stdin","utf8"));