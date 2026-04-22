function processData(rawData) {
    const allLines = rawData.split("\n");

    const [pointsCount, stationCount] = allLines[0].split(" ").map(Number);

    const pointCoordinates = allLines.slice(1, 1 + pointsCount)
        .map(line => line.split(" ").map(Number));

    const stationCoordinates = allLines.slice(1 + pointsCount, 1 + pointsCount + stationCount)
        .map(line => line.split(" ").map(Number));

    const results = pointCoordinates.map(([px, py]) => {
        const distancesToStations = stationCoordinates.map(([sx, sy], sIdx) => {
            const dist = Math.abs(px - sx) + Math.abs(py - sy);
            return { distValue: dist, stationIndex: sIdx + 1 };
        });

        const closestStation = distancesToStations.reduce((minSoFar, current) => {
            if (current.distValue < minSoFar.distValue) {
                return current;
            }
            return minSoFar;
        }, distancesToStations[0]);

        return closestStation.stationIndex;
    });

    console.log(results.join("\n"));
}
processData(require("fs").readFileSync("/dev/stdin", "utf8"));