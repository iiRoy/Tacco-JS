const getGameInputLines = () => {
    const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
    return rawInputData.split('\n');
};

const calculateRoundPoints = (cardA, cardB) => {
    const WIN_SCORE = 3;
    const DRAW_SCORE = 1;

    let scoreForA = 0;
    let scoreForB = 0;

    if (cardA > cardB) {
        scoreForA = WIN_SCORE;
    } else if (cardA < cardB) {
        scoreForB = WIN_SCORE;
    } else {
        scoreForA = DRAW_SCORE;
        scoreForB = DRAW_SCORE;
    }
    return { scoreA: scoreForA, scoreB: scoreForB };
};

let gameInputLines = getGameInputLines();

let playerOneTotalScore = 0;
let playerTwoTotalScore = 0;

const numberOfRounds = +gameInputLines.shift();

for (let roundIteration = 0; roundIteration < numberOfRounds; roundIteration++) {
    const currentRoundLine = gameInputLines.shift();
    const cardPair = currentRoundLine.split(' ');
    const playerOneCard = cardPair[0];
    const playerTwoCard = cardPair[1];

    const roundScores = calculateRoundPoints(playerOneCard, playerTwoCard);
    playerOneTotalScore += roundScores.scoreA;
    playerTwoTotalScore += roundScores.scoreB;
}

console.log(`${playerOneTotalScore} ${playerTwoTotalScore}`);
