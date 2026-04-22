const navigateSystem = (sourceData) => {
    const extractPathInfo = (rawData) => {
        const dataLines = rawData.split('\n');
        const elementCount = Number(dataLines[0]);
        const connections = dataLines.slice(1, elementCount + 1).map(Number);
        return connections;
    };

    const pathConnections = extractPathInfo(sourceData);

    const computeTraversalLength = (map, currentPoint, previouslyVisited, elapsedSteps) => {
        if (currentPoint === 2) {
            return elapsedSteps;
        }

        if (previouslyVisited.has(currentPoint)) {
            return -1;
        }

        const updatedVisited = new Set(previouslyVisited);
        updatedVisited.add(currentPoint);

        const nextPoint = map[currentPoint - 1];

        return computeTraversalLength(map, nextPoint, updatedVisited, elapsedSteps + 1);
    };

    const initialNode = 1;
    const finalResult = computeTraversalLength(pathConnections, pathConnections[0], new Set([initialNode]), 1);

    console.log(finalResult);
};

navigateSystem(require('fs').readFileSync('/dev/stdin', 'utf-8'));