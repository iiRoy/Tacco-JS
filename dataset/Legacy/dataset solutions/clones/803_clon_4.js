const fileSystem = require('fs');
const entireInputContent = fileSystem.readFileSync(process.stdin.fd, 'utf8');
const inputLines = entireInputContent.split('\n');
let currentLinePointer = 0;

function retrieveNextLine() {
    return inputLines[currentLinePointer++];
}

function calculateScore(itemCount, focusIndex, penaltyVal, dataPoints) {
    if (dataPoints[focusIndex] === 0) {
        return 0;
    }

    let totalSum = 0;
    for (const val of dataPoints) {
        totalSum += val;
    }

    const adjustedSum = totalSum * (100 - penaltyVal);
    const finalScore = adjustedSum / dataPoints[focusIndex];

    return Math.trunc(finalScore);
}

let currentInputLine;
while ((currentInputLine = retrieveNextLine()) !== '0 0 0') {
    const parameters = currentInputLine.split(' ');
    const countItems = parseInt(parameters[0], 10);
    const targetIndex = parseInt(parameters[1], 10) - 1;
    const penaltyPercentage = parseInt(parameters[2], 10);

    const scoreList = [];
    for (let k = 0; k < countItems; k++) {
        scoreList.push(parseInt(retrieveNextLine(), 10));
    }

    console.log(calculateScore(countItems, targetIndex, penaltyPercentage, scoreList));
}
