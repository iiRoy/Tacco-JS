var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineSegments = (rawData.trim()).split("\n");
var currentScores = [];

const TERMINATION_SIGNAL = "0 0";
const BATCH_SIZE = 5;
const CONTESTANT_LABELS = "ABCDE";

function parseAndSumPair(lineInputString) {
    const parts = lineInputString.split(" ");
    const firstNum = Number(parts[0]);
    const secondNum = Number(parts[1]);
    return firstNum + secondNum;
}

function determineBatchWinner(scoresCollection, labelSource) {
    let maxScoreFound = -Infinity;
    let winningIndex = -1;

    for (let scoreIdx = 0; scoreIdx < scoresCollection.length; scoreIdx++) {
        const individualScore = scoresCollection[scoreIdx];
        if (individualScore > maxScoreFound) {
            maxScoreFound = individualScore;
            winningIndex = scoreIdx;
        }
    }
    const winnerIdentifier = labelSource[winningIndex];
    return winnerIdentifier + " " + maxScoreFound;
}

for (let segmentIndex = 0; segmentIndex < lineSegments.length; segmentIndex++) {
    const currentSegment = lineSegments[segmentIndex];

    if (currentScores.length === 0 && currentSegment === TERMINATION_SIGNAL) {
        break;
    }

    const calculatedSum = parseAndSumPair(currentSegment);
    currentScores.push(calculatedSum);

    if (currentScores.length === BATCH_SIZE) {
        const resultOutput = determineBatchWinner(currentScores, CONTESTANT_LABELS);
        console.log(resultOutput);
        currentScores = [];
    }
}
