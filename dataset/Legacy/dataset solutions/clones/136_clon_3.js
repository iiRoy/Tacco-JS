const FILE_PATH_SOURCE = "./test.txt";
const FILE_READ_ENCODING = "utf8";
const REQUIRED_BALL_COUNT = 10;

var fileSystemModule = require("fs");
var fileContentRaw = fileSystemModule.readFileSync(FILE_PATH_SOURCE, FILE_READ_ENCODING);
var processedInputLines = fileContentRaw.trim().split(/\n/);

var totalProcessedCases = processedInputLines.length;

for (let currentCaseIterator = 1; currentCaseIterator < totalProcessedCases; currentCaseIterator++) {
    let currentBallStrings = processedInputLines[currentCaseIterator].trim().split(/\s/);
    let trackState = [0, 0];
    let isCurrentCaseValid = true;

    for (let ballIndex = 0; ballIndex < currentBallStrings.length; ballIndex++) {
        let parsedBallValue = parseInt(currentBallStrings[ballIndex], 10);

        let differenceTrackA = parsedBallValue - trackState[0];
        let differenceTrackB = parsedBallValue - trackState[1];

        if (differenceTrackA < 0 && differenceTrackB < 0) {
            console.log("NO");
            isCurrentCaseValid = false;
            break;
        }

        if (differenceTrackA <= differenceTrackB && differenceTrackA > 0) {
            trackState[0] = parsedBallValue;
        } else {
            trackState[1] = parsedBallValue;
        }
    }

    if (isCurrentCaseValid && currentBallStrings.length === REQUIRED_BALL_COUNT) {
        console.log("YES");
    }
}
