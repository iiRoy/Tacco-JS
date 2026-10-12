const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const gameLines = fileContent.trim().split('\n');

const roundLimit = Number(gameLines.shift());

const scoreAggregator = (currentTotals, roundDataString) => {
    const [p1Score, p2Score] = roundDataString.split(' ').map(Number);

    const p1RoundGain = (p1Score > p2Score) ? (p1Score + p2Score) : (p1Score === p2Score ? p1Score : 0);
    const p2RoundGain = (p2Score > p1Score) ? (p1Score + p2Score) : (p1Score === p2Score ? p2Score : 0);

    return {
        playerOneAccumulated: currentTotals.playerOneAccumulated + p1RoundGain,
        playerTwoAccumulated: currentTotals.playerTwoAccumulated + p2RoundGain
    };
};

const finalResult = gameLines.slice(0, roundLimit).reduce(scoreAggregator, { playerOneAccumulated: 0, playerTwoAccumulated: 0 });

console.log(`${finalResult.playerOneAccumulated} ${finalResult.playerTwoAccumulated}`);
