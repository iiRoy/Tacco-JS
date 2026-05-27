function createPoint(xCoord, yCoord) {
    return { x: xCoord, y: yCoord };
}

function locateAndPrioritizeMinimum(pointCollection) {
    if (pointCollection.length === 0) {
        return [];
    }

    let minIndex = pointCollection.reduce((currentMinIdx, currentPoint, idx, fullArray) => {
        const candidatePoint = fullArray[currentMinIdx];
        if (currentPoint.y < candidatePoint.y || (currentPoint.y === candidatePoint.y && currentPoint.x < candidatePoint.x)) {
            return idx;
        }
        return currentMinIdx;
    }, 0);

    const minimumPoint = pointCollection.splice(minIndex, 1)[0];
    pointCollection.unshift(minimumPoint);
    return pointCollection;
}

const sourceContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = sourceContent.split("\n");
const totalCount = Number.parseInt(lineSegments[0]);
const coordinateSet = [];

for (let i = 1; i < totalCount + 1; i++) {
    const segmentParts = lineSegments[i].split(" ");
    const xCoord = Number.parseInt(segmentParts[0]);
    const yCoord = Number.parseInt(segmentParts[1]);
    coordinateSet.push(createPoint(xCoord, yCoord));
}

locateAndPrioritizeMinimum(coordinateSet);

const firstElementRef = Number.parseInt(coordinateSet[0]);

const dummyResult = coordinateSet.subarray(1); // This line will cause a TypeError, replicating original behavior
