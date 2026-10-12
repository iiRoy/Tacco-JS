const processInputData = (rawText) => {
    const lines = rawText.split('\n');
    const [totalPoints, teleportOrigin, teleportDestination] = lines[0].split(' ').map(Number);
    return {
        pointCount: totalPoints,
        startNode: teleportOrigin,
        endNode: teleportDestination
    };
};

const computePathCounts = (pointCount, startNode, endNode) => {
    const distanceTally = new Map();

    Array.from({ length: pointCount - 1 }, (_, currentPointIdx) => currentPointIdx + 1)
        .forEach(currentPoint => {
            Array.from({ length: pointCount - currentPoint }, (_, nextPointIdx) => currentPoint + 1 + nextPointIdx)
                .forEach(nextPoint => {
                    const directRoute = nextPoint - currentPoint;
                    const teleportRoute = Math.abs(currentPoint - startNode) + 1 + Math.abs(nextPoint - endNode);
                    const effectiveDistance = Math.min(directRoute, teleportRoute);

                    distanceTally.set(effectiveDistance, (distanceTally.get(effectiveDistance) || 0) + 1);
                });
        });

    const finalCounts = Array(pointCount - 1).fill(0);
    for (let distVal = 1; distVal <= pointCount - 1; distVal++) {
        finalCounts[distVal - 1] = distanceTally.get(distVal) || 0;
    }
    return finalCounts;
};

function mainExecution(inputContent) {
    const { pointCount, startNode, endNode } = processInputData(inputContent);
    const calculatedCounts = computePathCounts(pointCount, startNode, endNode);
    console.log(calculatedCounts.join('\n'));
}

mainExecution(require("fs").readFileSync("/dev/stdin", "utf8"));
