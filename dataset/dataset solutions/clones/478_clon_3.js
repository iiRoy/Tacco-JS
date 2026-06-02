var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = rawData.trim().split("\n");

function generateFizzBuzz(numberValue) {
    const isDivisibleBy3 = (numberValue % 3 === 0);
    const isDivisibleBy5 = (numberValue % 5 === 0);

    if (isDivisibleBy3 && isDivisibleBy5) {
        return "FizzBuzz";
    } else if (isDivisibleBy3) {
        return "Fizz";
    } else if (isDivisibleBy5) {
        return "Buzz";
    } else {
        return String(numberValue);
    }
}

function findNextActivePlayerIndex(startingIndex, totalPlayersCount, playerActiveStatus) {
    let currentCandidateIndex = startingIndex;
    do {
        currentCandidateIndex = (currentCandidateIndex + 1) % totalPlayersCount;
    } while (!playerActiveStatus[currentCandidateIndex]);
    return currentCandidateIndex;
}

while (true) {
    let dimensionsString = lines.shift().split(" ");
    if (dimensionsString[0] === "0" && dimensionsString[1] === "0") {
        break;
    }

    let totalPlayers = parseInt(dimensionsString[0], 10);
    let totalRounds = parseInt(dimensionsString[1], 10);

    let playerActiveStatus = new Array(totalPlayers).fill(true);
    let currentActivePlayers = totalPlayers;

    let currentNumberToCall = 0;
    let lastPlayerTurnIndex = -1;

    for (let roundCounter = 0; roundCounter < totalRounds; roundCounter++) {
        if (currentActivePlayers === 1) {
            break;
        }

        currentNumberToCall++;
        lastPlayerTurnIndex = findNextActivePlayerIndex(lastPlayerTurnIndex, totalPlayers, playerActiveStatus);

        let expectedPlayerCall = generateFizzBuzz(currentNumberToCall);
        let actualPlayerCall = lines.shift();

        if (actualPlayerCall !== expectedPlayerCall) {
            playerActiveStatus[lastPlayerTurnIndex] = false;
            currentActivePlayers--;
        }

        if (currentActivePlayers === 1) {
            break;
        }
    }

    let survivingPlayerIDs = [];
    for (let playerIdx = 0; playerIdx < totalPlayers; playerIdx++) {
        if (playerActiveStatus[playerIdx]) {
            survivingPlayerIDs.push(playerIdx + 1);
        }
    }

    console.log(survivingPlayerIDs.join(" "));
}
