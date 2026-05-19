function generateFizzBuzzString(roundNumber) {
    const isDivisibleBy3 = roundNumber % 3 === 0;
    const isDivisibleBy5 = roundNumber % 5 === 0;

    if (isDivisibleBy3 && isDivisibleBy5) {
        return "FizzBuzz";
    } else if (isDivisibleBy3) {
        return "Fizz";
    } else if (isDivisibleBy5) {
        return "Buzz";
    } else {
        return roundNumber.toString();
    }
}

function findNextActivePlayerIndex(startIndex, totalPlayers, playerStatusArray) {
    let currentSearchIndex = startIndex;
    while (true) {
        if (playerStatusArray[currentSearchIndex]) {
            return currentSearchIndex;
        }
        currentSearchIndex = (currentSearchIndex + 1) % totalPlayers;
    }
}

var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var gameLines = rawData.trim().split("\n");

while (true) {
    var dimensionParts = gameLines.shift().split(" ");
    var playerTotal = parseInt(dimensionParts[0], 10);
    var gameRounds = parseInt(dimensionParts[1], 10);

    if (playerTotal === 0 && gameRounds === 0) {
        break;
    }

    var playerStatus = Array(playerTotal).fill(true);

    var currentRoundNumber = 0;
    var activePlayerPointer = 0;
    var roundsRemaining = gameRounds;

    while (roundsRemaining > 0) {
        currentRoundNumber++;
        var playerInputResponse = gameLines.shift();
        var expectedFizzBuzzOutput = generateFizzBuzzString(currentRoundNumber);

        activePlayerPointer = findNextActivePlayerIndex(activePlayerPointer, playerTotal, playerStatus);

        if (playerInputResponse !== expectedFizzBuzzOutput) {
            playerStatus[activePlayerPointer] = false;
        }

        roundsRemaining--;

        if (roundsRemaining === 0) {
            break;
        }

        activePlayerPointer = findNextActivePlayerIndex((activePlayerPointer + 1) % playerTotal, playerTotal, playerStatus);
    }

    var survivingPlayerNumbers = [];
    for (let playerIndex = 0; playerIndex < playerTotal; playerIndex++) {
        if (playerStatus[playerIndex]) {
            survivingPlayerNumbers.push(playerIndex + 1);
        }
    }

    console.log(survivingPlayerNumbers.join(" "));
}
