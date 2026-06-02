const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = fileContent.trim().split('\n');

const [playerCount, queryCount] = lines.shift().split(' ').map(Number);

const playerScores = Array.from({ length: playerCount }, () => 0);

const determineLeader = (scores) => {
    return scores.reduce((accumulator, currentScore, currentIndex) => {
        if (currentScore > accumulator.score) {
            return { score: currentScore, identifier: currentIndex };
        }
        return accumulator;
    }, { score: -Infinity, identifier: -1 });
};

lines.forEach((operationLine) => {
    const [targetIndex, scoreAdjustment] = operationLine.split(' ').map(Number);
    const actualPlayerIndex = targetIndex - 1;

    playerScores[actualPlayerIndex] += scoreAdjustment;

    const { score: currentHighestScore, identifier: currentLeaderIndex } = determineLeader(playerScores);

    console.log(`${currentLeaderIndex + 1} ${currentHighestScore}`);
});
