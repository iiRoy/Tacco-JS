function dataProcessor(sourceContent) {
    const allLines = sourceContent.split('\n');

    const [mapRows, mapCols, stepIncrement] = allLines[0].split(' ').map(Number);

    const valuePositionMap = new Map();
    for (let rIdx = 1; rIdx <= mapRows; rIdx++) {
        const rowData = allLines[rIdx].split(' ').map(Number);
        rowData.forEach((cellVal, cIdx) => {
            valuePositionMap.set(cellVal, [rIdx, cIdx + 1]);
        });
    }

    const queryEntryCount = Number(allLines[mapRows + 1]);
    const queryEntries = [];
    for (let qIdx = 1; qIdx <= queryEntryCount; qIdx++) {
        const [startNode, endNode] = allLines[mapRows + 1 + qIdx].split(' ').map(Number);
        queryEntries.push({ begin: startNode, finish: endNode });
    }

    const pathDistanceCache = new Map();

    const calculateSegmentManhattan = (valA, valB) => {
        const [xA, yA] = valuePositionMap.get(valA);
        const [xB, yB] = valuePositionMap.get(valB);
        return Math.abs(xB - xA) + Math.abs(yB - yA);
    };

    const resolveAccumulatedPath = (initialPoint, currentEndpoint) => {
        if (initialPoint === currentEndpoint) {
            return 0;
        }

        const cacheIdentifier = `${initialPoint}-${currentEndpoint}`;
        if (pathDistanceCache.has(cacheIdentifier)) {
            return pathDistanceCache.get(cacheIdentifier);
        }

        const previousEndpoint = currentEndpoint - stepIncrement;

        const distanceToPrev = resolveAccumulatedPath(initialPoint, previousEndpoint);
        const currentSegmentDist = calculateSegmentManhattan(previousEndpoint, currentEndpoint);

        const totalPathDist = distanceToPrev + currentSegmentDist;

        pathDistanceCache.set(cacheIdentifier, totalPathDist);

        return totalPathDist;
    };

    const finalResults = queryEntries.map(entry => {
        const { begin, finish } = entry;
        return resolveAccumulatedPath(begin, finish);
    });

    console.log(finalResults.join('\n'));
}

dataProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));