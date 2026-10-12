function processInputData(inputString) {
    const lines = inputString.split("\n");
    const dataCount = parseInt(lines[0], 10);

    const parseCoordinatePair = (lineContent) => lineContent.split(" ").map(Number);

    const pointsA = new Array(dataCount);
    const pointsC = new Array(dataCount);

    for (let idx = 0; idx < dataCount; idx++) {
        pointsA[idx] = parseCoordinatePair(lines[idx + 1]);
    }

    for (let idx = 0; idx < dataCount; idx++) {
        pointsC[idx] = parseCoordinatePair(lines[idx + dataCount + 1]);
    }

    const comparePointsA = (p1, p2) => {
        if (p1[0] !== p2[0]) {
            return p1[0] - p2[0];
        }
        return p1[1] - p2[1];
    };

    const comparePointsC = (p1, p2) => {
        if (p1[0] !== p2[0]) {
            return p1[0] - p2[0];
        }
        return p2[1] - p1[1];
    };

    pointsA.sort(comparePointsA);
    pointsC.sort(comparePointsC);

    let matchCount = 0;

    for (let idx = dataCount - 1; idx >= 0; idx--) {
        const currentPointA = pointsA[idx];
        for (let innerIdx = pointsC.length - 1; innerIdx >= 0; innerIdx--) {
            const currentPointC = pointsC[innerIdx];
            const canFormPair = currentPointA[0] < currentPointC[0] && currentPointA[1] < currentPointC[1];

            if (canFormPair) {
                matchCount++;
                pointsC.splice(innerIdx, 1);
                break;
            }
        }
    }

    console.log(matchCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
