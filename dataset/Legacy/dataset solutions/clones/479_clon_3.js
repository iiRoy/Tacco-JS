const STD_IN_SOURCE = '/dev/stdin';

function determineFizzBuzzOutput(numericValue) {
    let computedString = '';
    const isDivisibleByThree = (numericValue % 3) === 0;
    const isDivisibleByFive = (numericValue % 5) === 0;

    if (isDivisibleByThree) {
        computedString += 'Fizz';
    }
    if (isDivisibleByFive) {
        computedString += 'Buzz';
    }

    if (computedString === '') {
        return String(numericValue);
    } else {
        return computedString;
    }
}

const rawInputContent = require('fs').readFileSync(STD_IN_SOURCE, 'utf8');
let inputLines = rawInputContent.trim().split('\n');

while (true) {
    const currentInputLine = inputLines.shift();
    const dimensionTokens = currentInputLine.split(' ');
    const gameParameters = dimensionTokens.map(Number);

    const totalPlayers = gameParameters[0];
    const totalMoves = gameParameters[1];

    if (totalPlayers === 0 && totalMoves === 0) {
        break;
    }

    let remainingPlayers = Array.from({ length: totalPlayers }, (_, index) => index + 1);

    const moveExpectations = Array.from({ length: totalMoves }, () => inputLines.shift());

    let roundNumber = 1;
    let playerTurnPointer = 0;

    moveExpectations.forEach(function(expectedMoveString) {
        const actualFizzBuzzString = determineFizzBuzzOutput(roundNumber);

        if (expectedMoveString !== actualFizzBuzzString) {
            remainingPlayers.splice(playerTurnPointer, 1);
        }

        roundNumber++;
        playerTurnPointer++;

        if (playerTurnPointer >= remainingPlayers.length) {
            playerTurnPointer = 0;
        }
    });

    console.log(remainingPlayers.join(' '));
}
