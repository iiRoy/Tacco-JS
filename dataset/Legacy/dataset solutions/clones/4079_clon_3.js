function processInputData(rawData) {
    const lines = rawData.split("\n");

    const firstLineValues = lines[0].split(" ").map(valStr => parseInt(valStr, 10));
    const totalPoints = firstLineValues[0];
    const gridSize = firstLineValues[1];

    const xCoordinates = new Array(totalPoints);
    const yCoordinates = new Array(totalPoints);
    const pointColors = new Array(totalPoints);

    const modulusFactor = gridSize * 2;

    for (let pointIdx = 0; pointIdx < totalPoints; pointIdx++) {
        const currentPointLine = lines[pointIdx + 1].split(" ");
        const rawX = parseInt(currentPointLine[0], 10);
        const rawY = parseInt(currentPointLine[1], 10);
        const rawColor = currentPointLine[2];

        xCoordinates[pointIdx] = rawX % modulusFactor;
        yCoordinates[pointIdx] = rawY % modulusFactor;
        pointColors[pointIdx] = (rawColor === "W" ? 0 : 1);
    }

    let overallMaxCount = 0;

    const updateOverallMax = (currentMax, countA, total) => {
        return Math.max(currentMax, countA, total - countA);
    };

    for (let xOffset = 0; xOffset < gridSize; xOffset++) {
        let currentMatchCount = 0;
        const yMatchDistribution = new Array(modulusFactor).fill(0);
        const yMismatchDistribution = new Array(modulusFactor).fill(0);

        for (let dataIdx = 0; dataIdx < totalPoints; dataIdx++) {
            const effectiveX = xCoordinates[dataIdx] + xOffset;
            const cellXGroup = Math.floor(effectiveX / gridSize);
            const cellYGroup = Math.floor(yCoordinates[dataIdx] / gridSize);

            const parityCheck = (cellXGroup ^ cellYGroup) & 1;
            const expectedColor = pointColors[dataIdx];

            if (parityCheck === expectedColor) {
                currentMatchCount++;
                yMatchDistribution[yCoordinates[dataIdx]]++;
            } else {
                yMismatchDistribution[yCoordinates[dataIdx]]++;
            }
        }

        overallMaxCount = updateOverallMax(overallMaxCount, currentMatchCount, totalPoints);

        for (let yShiftIdx = 0; yShiftIdx < gridSize - 1; yShiftIdx++) {
            currentMatchCount += yMismatchDistribution[yShiftIdx] - yMatchDistribution[yShiftIdx] +
                                 yMismatchDistribution[yShiftIdx + gridSize] - yMatchDistribution[yShiftIdx + gridSize];

            overallMaxCount = updateOverallMax(overallMaxCount, currentMatchCount, totalPoints);
        }
    }

    console.log(overallMaxCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
