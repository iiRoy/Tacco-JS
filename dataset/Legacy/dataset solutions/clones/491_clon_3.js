var rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
var processedLines = rawInputData.trim().split("\n");

while (true) {
    var currentNValue = Number(processedLines.shift());
    if (currentNValue === 0) {
        break;
    }

    var operationStatus = "OK";
    var dataSegments = [];

    const parseLineToNumbers = (lineStr) => lineStr.split(" ").map(Number);

    for (let k = 0; k < currentNValue; k++) {
        let segmentData = parseLineToNumbers(processedLines.shift());
        dataSegments.push(segmentData);
    }

    operationStatus = "OK"; // Re-assignment, as in original's second 'var flag="OK";'

    const checkOverlap = (startA, endA, startB, endB) => startA < endB && endA > startB;

    for (let primaryIdx = 0; primaryIdx < currentNValue; primaryIdx++) {
        if (operationStatus === "NG") {
            break;
        }

        let currentItem = dataSegments[primaryIdx];
        let baseWeight = currentItem[0];
        let primaryRangeStart = currentItem[1];
        let primaryRangeEnd = currentItem[2];

        let cumulativeWeight = baseWeight;

        for (let secondaryIdx = 0; secondaryIdx < currentNValue; secondaryIdx++) {
            if (primaryIdx === secondaryIdx) {
                continue;
            }

            let otherItem = dataSegments[secondaryIdx];
            let secondaryRangeStart = otherItem[1];
            let secondaryRangeEnd = otherItem[2];

            if (checkOverlap(primaryRangeStart, primaryRangeEnd, secondaryRangeStart, secondaryRangeEnd)) {
                cumulativeWeight += otherItem[0];
            }

            if (cumulativeWeight > 150) {
                operationStatus = "NG";
                break; // Optimization: no need to check further in this inner loop if already NG
            }
        }
    }
    console.log(operationStatus);
}
