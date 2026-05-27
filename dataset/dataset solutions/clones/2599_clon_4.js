function ProcessInput(rawData) {
    const lines = rawData.split("\n");
    const elementCount = parseInt(lines[0], 10);
    const heightsData = lines[1].split(" ").map(Number);

    const determineLongestDescent = (dataPoints, currentIndex, currentRunLength, longestRunFound) => {
        if (currentIndex >= dataPoints.length - 1) {
            return longestRunFound;
        }

        const currentPoint = dataPoints[currentIndex];
        const nextPoint = dataPoints[currentIndex + 1];

        const newRunLength = (currentPoint >= nextPoint) ? currentRunLength + 1 : 0;
        const newLongestRun = Math.max(longestRunFound, newRunLength);

        return determineLongestDescent(dataPoints, currentIndex + 1, newRunLength, newLongestRun);
    };

    const peakNonIncreasingStreak = determineLongestDescent(heightsData, 0, 0, 0);

    console.log(peakNonIncreasingStreak);
}
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
