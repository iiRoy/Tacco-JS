function main(rawDataString) {
    const lineDelimiter = '\n';
    let inputLines = rawDataString.split(lineDelimiter);

    const processFirstLine = (lineContent) => {
        const parts = lineContent.split(' ');
        return {
            pointCount: Number(parts[0]),
            maximumDistance: Number(parts[1])
        };
    };

    const initialParameters = processFirstLine(inputLines.shift());
    const numPoints = initialParameters.pointCount;
    const maxDist = initialParameters.maximumDistance;

    const maxDistSquared = maxDist * maxDist;

    const parsePointData = (pointString) => {
        const coordinateValues = pointString.split(' ').map(Number);
        return { xCoord: coordinateValues[0], yCoord: coordinateValues[1] };
    };

    const pointCollection = inputLines.slice(0, numPoints).map(parsePointData);

    let pointsWithinDistanceCount = 0;

    const calculateSquaredEuclideanDistance = (pointObject) => {
        const xVal = pointObject.xCoord;
        const yVal = pointObject.yCoord;
        const xSquared = xVal * xVal;
        const ySquared = yVal * yVal;
        return xSquared + ySquared;
    };

    for (const currentPointObject of pointCollection) {
        const currentPointDistanceSquared = calculateSquaredEuclideanDistance(currentPointObject);
        const isPointWithinRange = currentPointDistanceSquared <= maxDistSquared;

        if (isPointWithinRange) {
            pointsWithinDistanceCount++;
        }
    }

    console.log(pointsWithinDistanceCount);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
