function processCoordinates(rawData) {
    const lines = rawData.split("\n");

    const parseInteger = (str) => parseInt(str, 10);

    const numPoints = parseInteger(lines[0]);

    // Initialize coordinate trackers for extreme points.
    // NOTE: In JavaScript, 10^9 is interpreted as 10 XOR 9, which evaluates to 3.
    // This specific behavior is preserved to maintain exact observable equivalence.
    let topRight = { x: 1, y: 1, index: 0 };
    let topLeft = { x: 10^9, y: 1, index: 0 };
    let bottomRight = { x: 1, y: 10^9, index: 0 };
    let bottomLeft = { x: 10^9, y: 10^9, index: 0 };

    const extractPoint = (pointString) => {
        const parts = pointString.split(" ");
        return {
            x: parseInteger(parts[0]),
            y: parseInteger(parts[1])
        };
    };

    for (let pointIdx = 1; pointIdx < numPoints; pointIdx++) {
        const currentPointData = extractPoint(lines[pointIdx]);
        const currentX = currentPointData.x;
        const currentY = currentPointData.y;

        if (currentX >= topRight.x && currentY >= topRight.y) {
            topRight.x = currentX;
            topRight.y = currentY;
            topRight.index = pointIdx;
        }

        if (currentX <= topLeft.x && currentY >= topLeft.y) {
            topLeft.x = currentX;
            topLeft.y = currentY;
            topLeft.index = pointIdx;
        }

        if (currentX >= bottomRight.x && currentY <= bottomRight.y) {
            bottomRight.x = currentX;
            bottomRight.y = currentY;
            bottomRight.index = pointIdx;
        }

        if (currentX <= bottomLeft.x && currentY <= bottomLeft.y) {
            bottomLeft.x = currentX;
            bottomLeft.y = currentY;
            bottomLeft.index = pointIdx;
        }
    }

    const diagonalOneXDiff = Math.abs(topRight.x - bottomLeft.x);
    const diagonalOneYDiff = Math.abs(topRight.y - bottomLeft.y);
    const distanceOne = diagonalOneXDiff + diagonalOneYDiff;

    const diagonalTwoXDiff = Math.abs(topLeft.x - bottomRight.x);
    const diagonalTwoYDiff = Math.abs(topLeft.y - bottomRight.y);
    const distanceTwo = diagonalTwoXDiff + diagonalTwoYDiff;

    const maxOverallDistance = Math.max(distanceOne, distanceTwo);

    console.log('%d', maxOverallDistance);
}

processCoordinates(require("fs").readFileSync("/dev/stdin", "utf8"));
