function processCoordinateData(rawData) {
    const allInputLines = rawData.split("\n");

    const numberOfPoints = Number(allInputLines[0]);

    const parseCoordinateLine = (lineStr) => {
        const parts = lineStr.split(/\s/g);
        const xCoord = Number(parts[0]);
        const yCoord = Number(parts[1]);
        return [xCoord, yCoord];
    };

    const parsedCoordinates = [];

    for (let lineIndex = 1; lineIndex < allInputLines.length; lineIndex++) {
        const currentLine = allInputLines[lineIndex];
        parsedCoordinates.push(parseCoordinateLine(currentLine));
    }

    const calculateEuclideanDistance = (point1, point2) => {
        const deltaX = point1[0] - point2[0];
        const deltaY = point1[1] - point2[1];

        const squaredDeltaX = deltaX * deltaX;
        const squaredDeltaY = deltaY * deltaY;

        return Math.sqrt(squaredDeltaX + squaredDeltaY);
    };

    let totalAccumulatedDistance = 0;

    for (let firstPointIndex = 0; firstPointIndex < parsedCoordinates.length - 1; firstPointIndex++) {
        for (let secondPointIndex = firstPointIndex + 1; secondPointIndex < parsedCoordinates.length; secondPointIndex++) {
            const pointA = parsedCoordinates[firstPointIndex];
            const pointB = parsedCoordinates[secondPointIndex];
            totalAccumulatedDistance += calculateEuclideanDistance(pointA, pointB);
        }
    }

    const finalCalculatedValue = (totalAccumulatedDistance * 2) / numberOfPoints;

    console.log(finalCalculatedValue);
}

processCoordinateData(require('fs').readFileSync('/dev/stdin', 'utf8'));
