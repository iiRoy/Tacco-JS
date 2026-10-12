function solveProblem(rawInputString) {
    const trimmedInput = rawInputString.trim();
    const inputLines = trimmedInput.split("\n");

    const firstLineParts = inputLines[0].split(" ");
    const circuitLength = parseInt(firstLineParts[0], 10);
    const numStops = parseInt(firstLineParts[1], 10);

    const stopLocations = inputLines[1].split(" ").map(Number);

    const segmentLengths = [];

    for (let currentIndex = 0; currentIndex < numStops; currentIndex++) {
        let currentSegmentLength;
        if (currentIndex + 1 === numStops) {
            currentSegmentLength = (circuitLength - stopLocations[currentIndex]) + stopLocations[0];
        } else {
            currentSegmentLength = stopLocations[currentIndex + 1] - stopLocations[currentIndex];
        }
        segmentLengths.push(currentSegmentLength);
    }

    const longestSegment = Math.max(...segmentLengths);

    console.log(circuitLength - longestSegment);
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
