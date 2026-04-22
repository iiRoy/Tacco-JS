const processPath = (inputSource) => {
    const rawDataLines = inputSource.split("\n");

    const initialSettings = rawDataLines[0].split(" ").map(Number);
    const maximumSegments = initialSettings[0];
    const spatialLimit = initialSettings[1];
    const segmentMeasures = rawDataLines[1].split(" ").map(Number);

    const computeReachablePoints = (
        currentSegmentIndex,
        accumulatedLength,
        reachedPointsCount
    ) => {
        if (accumulatedLength >= spatialLimit) {
            return reachedPointsCount;
        }

        if (currentSegmentIndex >= maximumSegments) {
            return reachedPointsCount;
        }

        return computeReachablePoints(
            currentSegmentIndex + 1,
            accumulatedLength + segmentMeasures[currentSegmentIndex],
            reachedPointsCount + 1
        );
    };

    const finalResult = computeReachablePoints(0, 0, 1);

    console.log(finalResult);
};

processPath(require("fs").readFileSync("/dev/stdin", "utf8"));