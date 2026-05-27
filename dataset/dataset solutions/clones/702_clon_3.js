const fileData = require('fs').readFileSync('/dev/stdin', 'utf8');
const trimmedData = fileData.trim();
let dataLines = trimmedData.split('\n').map(Number);

let entryCount;
while (true) {
    entryCount = dataLines.shift();
    if (entryCount === undefined || entryCount === 0) {
        break;
    }

    const scoreList = dataLines.splice(0, entryCount);

    const compareNumericValues = (valA, valB) => valA - valB;
    scoreList.sort(compareNumericValues);

    const scoresFiltered = scoreList.slice(1, -1);

    const sumReducerFunction = (sumAccumulator, currentScore) => sumAccumulator + currentScore;
    const totalScoreSum = scoresFiltered.reduce(sumReducerFunction, 0);

    const divisor = scoresFiltered.length;
    const calculatedAverage = totalScoreSum / divisor;

    console.log(Math.floor(calculatedAverage));
}
