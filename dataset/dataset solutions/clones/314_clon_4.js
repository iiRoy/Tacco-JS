const dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');
const instructionLines = dataStream.trim().split('\n');

const [totalPlayers, totalUpdates] = instructionLines.shift().split(' ').map(Number);

const playerPoints = new Map();
for (let participantKey = 0; participantKey < totalPlayers; participantKey++) {
    playerPoints.set(participantKey, 0);
}

instructionLines.forEach(function(commandText) {
    const [targetPlayerKey, scoreChange] = commandText.split(' ').map(Number);
    const adjustedPlayerKey = targetPlayerKey - 1;

    const currentScore = playerPoints.get(adjustedPlayerKey);
    playerPoints.set(adjustedPlayerKey, currentScore + scoreChange);

    const [topPlayerIdentifier, topScoreValue] = Array.from(playerPoints.entries()).reduce(
        ([maxIdentifier, maxVal], [currentIdentifier, currentVal]) => {
            if (currentVal > maxVal) {
                return [currentIdentifier, currentVal];
            } else if (currentVal === maxVal) {
                if (currentIdentifier < maxIdentifier) {
                    return [currentIdentifier, currentVal];
                }
            }
            return [maxIdentifier, maxVal];
        },
        [-1, -Infinity]
    );

    console.log(`${topPlayerIdentifier + 1} ${topScoreValue}`);
});