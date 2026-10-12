const parseCoordinatePair = (coordString) => {
    const [xStr, yStr] = coordString.split(' ');
    return { x: parseInt(xStr, 10), y: parseInt(yStr, 10) };
};

const computeManhattanDistance = (point1, point2) => {
    const deltaX = Math.abs(point1.x - point2.x);
    const deltaY = Math.abs(point1.y - point2.y);
    return deltaX + deltaY;
};

function processInputData(rawInputString) {
    const inputLines = rawInputString.split("\n");

    const [numPointsAStr, numCheckpointsBStr] = inputLines[0].split(" ");
    const numPointsA = parseInt(numPointsAStr, 10);
    const numCheckpointsB = parseInt(numCheckpointsBStr, 10);

    const pointsA = [];
    for (let i = 0; i < numPointsA; i++) {
        pointsA.push(parseCoordinatePair(inputLines[1 + i]));
    }

    const checkpointsB = [];
    for (let i = 0; i < numCheckpointsB; i++) {
        checkpointsB.push(parseCoordinatePair(inputLines[1 + numPointsA + i]));
    }

    for (let pointIndex = 0; pointIndex < numPointsA; pointIndex++) {
        const currentPoint = pointsA[pointIndex];

        let minimumAchievedDistance = computeManhattanDistance(currentPoint, checkpointsB[0]);
        let closestCheckpointOutputIndex = 1;

        for (let checkpointIndex = 1; checkpointIndex < numCheckpointsB; checkpointIndex++) {
            const currentCheckpoint = checkpointsB[checkpointIndex];
            const calculatedDistance = computeManhattanDistance(currentPoint, currentCheckpoint);

            if (calculatedDistance < minimumAchievedDistance) {
                minimumAchievedDistance = calculatedDistance;
                closestCheckpointOutputIndex = checkpointIndex + 1;
            }
        }
        console.log(closestCheckpointOutputIndex);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
