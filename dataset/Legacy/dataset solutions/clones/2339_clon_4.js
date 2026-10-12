'use strict';

function graphProcessor(rawDataContent) {
    const dataLines = rawDataContent.trim().split('\n');
    const [nodeCountVal, sourceNodeOne, sourceNodeTwo] = dataLines[0].split(' ').map(Number);

    const graphConnections = Array.from({ length: nodeCountVal + 1 }, () => new Set());
    dataLines.slice(1).forEach(line => {
        const [nodeXid, nodeYid] = line.split(' ').map(Number);
        graphConnections[nodeXid].add(nodeYid);
        graphConnections[nodeYid].add(nodeXid);
    });

    const breadthFirstSearch = (initialPoint, totalPoints, graphStructure) => {
        const distanceValues = Array(totalPoints + 1).fill(-1);
        const queueElements = [[initialPoint, 0]];
        distanceValues[initialPoint] = 0;

        let queuePointer = 0;
        while (queuePointer < queueElements.length) {
            const [currentPoint, currentPathLength] = queueElements[queuePointer++];
            for (const neighborPoint of graphStructure[currentPoint]) {
                if (distanceValues[neighborPoint] === -1) {
                    distanceValues[neighborPoint] = currentPathLength + 1;
                    queueElements.push([neighborPoint, currentPathLength + 1]);
                }
            }
        }
        return distanceValues;
    };

    const distanceSetOne = breadthFirstSearch(sourceNodeOne, nodeCountVal, graphConnections);
    const distanceSetTwo = breadthFirstSearch(sourceNodeTwo, nodeCountVal, graphConnections);

    const maximumAchieved = Array.from({ length: nodeCountVal + 1 }, (_, idx) => idx)
        .slice(1)
        .reduce((currentMax, nodeIdx) => {
            if (distanceSetOne[nodeIdx] < distanceSetTwo[nodeIdx]) {
                return Math.max(currentMax, distanceSetOne[nodeIdx]);
            }
            return currentMax;
        }, 0);

    console.log(maximumAchieved);
}

graphProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));
