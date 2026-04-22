const gameSource = require('fs').readFileSync('/dev/stdin', 'utf8');

const gameSegments = gameSource.trim().split('\n');

const totalRounds = parseInt(gameSegments[0], 10);
const battleRounds = gameSegments.slice(1, 1 + totalRounds);

const assessDuelResult = (playerOneChoice, playerTwoChoice) => {
    if (playerOneChoice > playerTwoChoice) {
        return [3, 0];
    } else if (playerOneChoice < playerTwoChoice) {
        return [0, 3];
    } else {
        return [1, 1];
    }
};

const finalTally = battleRounds.reduce((scoreAccumulator, currentDuel) => {
    const [p1c, p2c] = currentDuel.split(' ');
    const [p1Pts, p2Pts] = assessDuelResult(p1c, p2c);

    scoreAccumulator[0] += p1Pts;
    scoreAccumulator[1] += p2Pts;
    return scoreAccumulator;
}, [0, 0]);

console.log(finalTally[0] + ' ' + finalTally[1]);