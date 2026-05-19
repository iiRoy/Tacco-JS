function solveProblem(rawInputString) {
    const parseLineOfNumbers = (lineString) => lineString.split(" ").map(Number);

    const processedLines = rawInputString.split("\n").map(parseLineOfNumbers);

    const [totalNodes, numIntervals] = processedLines[0];

    const intervalList = processedLines.slice(1, numIntervals + 1);

    const compareIntervalsByEnd = (intervalA, intervalB) => intervalA[1] - intervalB[1];
    intervalList.sort(compareIntervalsByEnd);

    let currentCutPoint = intervalList[0][1] - 2;
    let minimumCuts = 1;

    for (let intervalIdx = 1; intervalIdx < numIntervals; intervalIdx++) {
        const currentInterval = intervalList[intervalIdx];
        const intervalStartBoundary = currentInterval[0] - 1;

        if (intervalStartBoundary <= currentCutPoint) {
            continue;
        } else {
            currentCutPoint = currentInterval[1] - 2;
            minimumCuts++;
        }
    }

    console.log(minimumCuts);
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
