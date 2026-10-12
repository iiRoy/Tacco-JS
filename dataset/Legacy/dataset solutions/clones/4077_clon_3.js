function calculateTiledColor(baseX, baseY, initialTileColor, tileDimension, targetPointX, targetPointY) {
    let currentTileColor = initialTileColor;

    const xOffsetDivisor = Math.floor((targetPointX - baseX) / tileDimension);
    if (xOffsetDivisor % 2 !== 0) {
        currentTileColor = 1 - currentTileColor;
    }

    const yOffsetDivisor = Math.floor((targetPointY - baseY) / tileDimension);
    if (yOffsetDivisor % 2 !== 0) {
        currentTileColor = 1 - currentTileColor;
    }

    return currentTileColor;
}

function processInputData(rawInputString) {
    const inputLines = rawInputString.split("\n");
    const firstLineParts = inputLines[0].split(" ");

    const totalDataPoints = Number(firstLineParts[0]);
    const gridDimensionSize = Number(firstLineParts[1]);

    const xCoordinates = [];
    const yCoordinates = [];
    const pointColors = [];

    for (let dataIndex = 0; dataIndex < totalDataPoints; dataIndex++) {
        const currentDataParts = inputLines[dataIndex + 1].split(" ");
        xCoordinates.push(Number(currentDataParts[0]));
        yCoordinates.push(Number(currentDataParts[1]));
        pointColors.push(currentDataParts[2] === "B" ? 0 : 1);
    }

    let maximumMatchingPoints = 0;

    for (let basePointIndex = 0; basePointIndex < totalDataPoints; basePointIndex++) {
        const currentBaseX = xCoordinates[basePointIndex];
        const currentBaseY = yCoordinates[basePointIndex];
        const initialColorForGrid = pointColors[0];

        for (let shiftX = 0; shiftX < gridDimensionSize; shiftX++) {
            for (let shiftY = 0; shiftY < gridDimensionSize; shiftY++) {
                let currentMatchCount = 0;
                const effectiveBaseX = currentBaseX - shiftX;
                const effectiveBaseY = currentBaseY - shiftY;

                for (let pointIndex = 0; pointIndex < totalDataPoints; pointIndex++) {
                    const targetX = xCoordinates[pointIndex];
                    const targetY = yCoordinates[pointIndex];
                    const expectedColor = pointColors[pointIndex];

                    const calculatedColor = calculateTiledColor(
                        effectiveBaseX,
                        effectiveBaseY,
                        initialColorForGrid,
                        gridDimensionSize,
                        targetX,
                        targetY
                    );

                    if (calculatedColor === expectedColor) {
                        currentMatchCount++;
                    }
                }
                maximumMatchingPoints = Math.max(maximumMatchingPoints, currentMatchCount);
            }
        }
    }

    console.log('%d', maximumMatchingPoints);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
