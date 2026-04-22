function findRemainingSquarePoints(rawCoordinateData) {
    const processedValues = rawCoordinateData
        .split(/\s+/)
        .map(coordinateString => parseInt(coordinateString.trim(), 10));

    if (processedValues.length !== 4 || processedValues.some(isNaN)) {
        return "";
    }

    const [p1x, p1y, p2x, p2y] = processedValues;

    const initialPointA = { x: p1x, y: p1y };
    const initialPointB = { x: p2x, y: p2y };

    const vectorComponentX = initialPointB.x - initialPointA.x;
    const vectorComponentY = initialPointB.y - initialPointA.y;

    const rotatedVectorX = -vectorComponentY;
    const rotatedVectorY = vectorComponentX;

    const thirdPointC = {
        x: initialPointB.x + rotatedVectorX,
        y: initialPointB.y + rotatedVectorY
    };

    const fourthPointD = {
        x: thirdPointC.x - vectorComponentX,
        y: thirdPointC.y - vectorComponentY
    };

    const outputString = `${thirdPointC.x} ${thirdPointC.y} ${fourthPointD.x} ${fourthPointD.y}`;

    return outputString;
}