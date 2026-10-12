var inputSource = require('fs').readFileSync('/dev/stdin', 'utf8');
var gameLines = inputSource.split('\n');

var totalRounds = +gameLines.shift();

const calculateRoundPoints = (playerAHand, playerBHand) => {
    const comparisonResult = playerAHand.localeCompare(playerBHand);

    const pointMap = {
        '-1': [0, 3],
        '0': [1, 1],
        '1': [3, 0]
    };

    return pointMap[Math.sign(comparisonResult)] || [0, 0];
};

const finalScores = gameLines
    .slice(0, totalRounds)
    .reduce((scoreAccumulator, currentRoundLine) => {
        const [playerOneHand, playerTwoHand] = currentRoundLine.split(' ');

        const [roundPointsOne, roundPointsTwo] = calculateRoundPoints(playerOneHand, playerTwoHand);

        return [
            scoreAccumulator[0] + roundPointsOne,
            scoreAccumulator[1] + roundPointsTwo
        ];
    }, [0, 0]);

console.log(finalScores[0] + ' ' + finalScores[1]);
