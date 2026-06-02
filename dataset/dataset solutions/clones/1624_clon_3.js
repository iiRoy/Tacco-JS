function ProcessInput(rawData) {
    let countOfDistantPoints = 0;

    const lineSegments = rawData.split('\n');

    const firstLineParts = lineSegments[0].split(' ');
    const minimumDistanceThreshold = Number(firstLineParts[1]);

    const pointCoordinates = lineSegments.slice(1);

    const checkDistanceCondition = (xVal, yVal, threshold) => {
        const xSquared = xVal * xVal;
        const ySquared = yVal * yVal;
        const sumOfSquares = xSquared + ySquared;
        const distanceToOrigin = Math.sqrt(sumOfSquares);
        return Math.round(distanceToOrigin) >= threshold;
    };

    for (let idx = 0; idx < pointCoordinates.length; idx++) {
        const currentCoordPairStr = pointCoordinates[idx].split(' ');
        const xCoord = Number(currentCoordPairStr[0]);
        const yCoord = Number(currentCoordPairStr[1]);

        if (checkDistanceCondition(xCoord, yCoord, minimumDistanceThreshold)) {
            countOfDistantPoints++;
        }
    }

    console.log(countOfDistantPoints);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
