const appConfig = { stdin: '/dev/stdin', newline: '\n' };

const fileSystemModule = require('fs');

const rawInputContent = fileSystemModule.readFileSync(appConfig.stdin, 'ascii');
const processedInputString = rawInputContent.trim();
let gameInputLines = processedInputString.split(appConfig.newline);

gameInputLines.shift();

function determineMatchPoints(matchLine, currentTotalScores) {
    const scoreComponents = matchLine.split(' ');
    const teamAScore = parseInt(scoreComponents[0], 10);
    const teamBScore = parseInt(scoreComponents[1], 10);

    if (teamAScore > teamBScore) {
        currentTotalScores[0] += 3;
    } else if (teamAScore < teamBScore) {
        currentTotalScores[1] += 3;
    } else {
        currentTotalScores[0]++;
        currentTotalScores[1]++;
    }
    return currentTotalScores;
}

const initialGameScores = [0, 0];
const finalGameResults = gameInputLines.reduce((accumulatorScores, singleMatchString) => {
    return determineMatchPoints(singleMatchString, accumulatorScores);
}, initialGameScores);

console.log(finalGameResults.join(' '));
