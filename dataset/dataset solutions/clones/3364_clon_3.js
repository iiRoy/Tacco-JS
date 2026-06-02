const parseNumericValue = (str) => Number(str);

function calculateMaxScore(trackLength, numLocations, sortedLocations, startRightFirst) {
    let currentRightPointer = 0;
    let currentLeftPointer = numLocations - 1;
    let currentDistLeft = trackLength - sortedLocations[currentLeftPointer];
    let currentDistRight = sortedLocations[currentRightPointer];
    let currentTotalScore = 0;

    for (let iterationCount = 0; iterationCount < numLocations; iterationCount++) {
        let moveRightThisTurn;

        if (iterationCount === 0) {
            moveRightThisTurn = startRightFirst;
        } else {
            if (startRightFirst) {
                moveRightThisTurn = (currentDistLeft <= currentDistRight);
            } else {
                moveRightThisTurn = (currentDistRight > currentDistLeft);
            }
        }

        if (moveRightThisTurn) {
            currentTotalScore += currentDistRight;
            currentDistLeft += currentDistRight;
            currentDistRight = sortedLocations[currentRightPointer + 1] - sortedLocations[currentRightPointer];
            currentRightPointer++;
        } else {
            currentTotalScore += currentDistLeft;
            currentDistRight += currentDistLeft;
            currentDistLeft = sortedLocations[currentLeftPointer] - sortedLocations[currentLeftPointer - 1];
            currentLeftPointer--;
        }
    }
    return currentTotalScore;
}

let inputLines = [];
let unusedVar;

const ioHandler = require("readline");
const interfaceInstance = ioHandler.createInterface({
    input: process.stdin,
    output: process.stdout,
});

interfaceInstance.on("line", (lineContent) => {
    inputLines.push(lineContent);
});

interfaceInstance.on("close", () => {
    const [trackLength, numLocations] = inputLines.shift().split(" ").map(parseNumericValue);

    const sortedLocations = Array(numLocations);
    for (let locationIndex = 0; locationIndex < numLocations; locationIndex++) {
        sortedLocations[locationIndex] = parseNumericValue(inputLines[locationIndex]);
    }
    sortedLocations.sort((valA, valB) => valA - valB);

    const maxScoreStartingLeft = calculateMaxScore(trackLength, numLocations, sortedLocations, false);
    const maxScoreStartingRight = calculateMaxScore(trackLength, numLocations, sortedLocations, true);

    console.log(Math.max(maxScoreStartingLeft, maxScoreStartingRight));
});
