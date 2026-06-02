var inputLines = [];
var inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputReader.on('line', function (currentLine) {
    inputLines.push(currentLine);
});

inputReader.on('close', function () {
    const [pathLen, startIdxA, startIdxB, endIdxC, endIdxD] = inputLines[0].split(" ").map(Number);
    const pathSequence = inputLines[1];

    let outcomeMessage = "Yes";
    let bypassPathFound = false;

    const maxRelevantPosition = Math.max(endIdxC, endIdxD);

    const hasBlockingSegment = Array.from({ length: pathSequence.length - 1 }, (_, currentPos) => currentPos)
        .some(currentPos =>
            pathSequence.substring(currentPos, currentPos + 2) === "##" &&
            startIdxA <= currentPos &&
            currentPos + 1 <= maxRelevantPosition
        );

    if (hasBlockingSegment) {
        outcomeMessage = "No";
    } else {
        bypassPathFound = Array.from({ length: pathSequence.length - 2 }, (_, currentPos) => currentPos)
            .some(currentPos =>
                pathSequence.substring(currentPos, currentPos + 3) === "..." &&
                startIdxB <= currentPos &&
                (currentPos + 3 <= endIdxD || currentPos + 1 === endIdxD)
            );

        if (endIdxD < endIdxC && !bypassPathFound) {
            const checkCriticalObstacles = (pathStr, dPos, bPos) => {
                return (pathStr[dPos - 2] === "#" || pathStr[dPos] === "#") &&
                       (pathStr[bPos - 2] === "#" || pathStr[bPos] === "#");
            };

            if (checkCriticalObstacles(pathSequence, endIdxD, startIdxB)) {
                outcomeMessage = "No";
            }
        }
    }

    console.log(outcomeMessage);
});
