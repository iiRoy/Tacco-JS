const gameData = require('node:fs').readFileSync('/dev/stdin', 'utf8');

const processedContent = gameData.trim().split('\n');
const totalRounds = parseInt(processedContent.shift(), 10);

const initialScores = { playerOne: 0, playerTwo: 0 };

const roundDetails = Array.from({ length: totalRounds }, (_, index) => processedContent[index]);

const finalScoresAccumulated = roundDetails.reduce((currentScores, currentRoundLine) => {
    const [scoreA, scoreB] = currentRoundLine.split(' ').map(s => parseInt(s, 10));

    let updatedPlayerOneScore = currentScores.playerOne;
    let updatedPlayerTwoScore = currentScores.playerTwo;

    const outcomeIndicator = Math.sign(scoreA - scoreB);

    switch (outcomeIndicator) {
        case 1:
            updatedPlayerOneScore += scoreA + scoreB;
            break;
        case -1:
            updatedPlayerTwoScore += scoreA + scoreB;
            break;
        case 0:
            updatedPlayerOneScore = scoreA;
            updatedPlayerTwoScore = scoreB;
            break;
    }

    return { playerOne: updatedPlayerOneScore, playerTwo: updatedPlayerTwoScore };
}, initialScores);

console.log(finalScoresAccumulated.playerOne + " " + finalScoresAccumulated.playerTwo);