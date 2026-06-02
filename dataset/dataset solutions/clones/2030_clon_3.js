function Main(rawData) {
    const lines = rawData.split("\n");
    const firstLineParts = lines[0].split(" ");

    const totalNodes = Number(firstLineParts[0]);
    const specialNodeX = Number(firstLineParts[1]);
    const specialNodeY = Number(firstLineParts[2]);

    const distanceCounts = new Array(totalNodes - 1).fill(0);

    const getNodeRegion = (nodeIdentifier, xBoundary, yBoundary) => {
        if (nodeIdentifier <= xBoundary) {
            return 'A'; // Region 1: 1 to X
        }
        if (nodeIdentifier < yBoundary) {
            return 'B'; // Region 2: X+1 to Y-1
        }
        return 'C';     // Region 3: Y to N
    };

    const computeShortestDistance = (nodeOne, nodeTwo, xValue, yValue) => {
        let calculatedPathLength;

        const regionOne = getNodeRegion(nodeOne, xValue, yValue);
        const regionTwo = getNodeRegion(nodeTwo, xValue, yValue);

        if (regionOne === 'A' && regionTwo === 'A') {
            calculatedPathLength = nodeTwo - nodeOne;
        } else if (regionOne === 'A' && regionTwo === 'B') {
            const directPathToJFromX = nodeTwo - xValue;
            const pathViaYToJFromX = (yValue - nodeTwo) + 1;
            calculatedPathLength = (xValue - nodeOne) + Math.min(directPathToJFromX, pathViaYToJFromX);
        } else if (regionOne === 'A' && regionTwo === 'C') {
            calculatedPathLength = (xValue - nodeOne) + 1 + (nodeTwo - yValue);
        } else if (regionOne === 'B' && regionTwo === 'B') {
            const directPathBetweenNodes = nodeTwo - nodeOne;
            const pathThroughXandY = (nodeOne - xValue) + 1 + (yValue - nodeTwo);
            calculatedPathLength = Math.min(directPathBetweenNodes, pathThroughXandY);
        } else if (regionOne === 'B' && regionTwo === 'C') {
            const pathFromIToXThenY = (nodeOne - xValue) + 1;
            const pathFromIToY = yValue - nodeOne;
            calculatedPathLength = (nodeTwo - yValue) + Math.min(pathFromIToXThenY, pathFromIToY);
        } else if (regionOne === 'C' && regionTwo === 'C') {
            calculatedPathLength = nodeTwo - nodeOne;
        }
        return calculatedPathLength;
    };

    for (let startNode = 1; startNode <= totalNodes - 1; startNode++) {
        for (let endNode = startNode + 1; endNode <= totalNodes; endNode++) {
            const currentDistance = computeShortestDistance(startNode, endNode, specialNodeX, specialNodeY);
            distanceCounts[currentDistance - 1]++;
        }
    }

    const finalOutput = distanceCounts.join("\n");
    console.log('%s', finalOutput);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
