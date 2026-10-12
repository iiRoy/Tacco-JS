var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineData = rawData.trim().split('\n');

while (true) {
    var dims = lineData.shift().split(' ');

    if (dims.join(' ') === '0 0') {
        break;
    }

    var rows = parseInt(dims[0], 10);
    var iterations = parseInt(dims[1], 10);

    var playerStatus = [];
    for (var playerIndex = 0; playerIndex < rows; playerIndex++) {
        playerStatus[playerIndex] = true;
    }

    var currentNum = 0;
    var currentPlayerIdx = 0;
    var expectedOutput = '';
    var activePlayersCount = rows;

    while (iterations--) {
        if (activePlayersCount === 1) {
            break;
        }

        currentNum++;
        var receivedInput = lineData.shift();

        if (currentNum % 15 === 0) {
            expectedOutput = 'FizzBuzz';
        } else if (currentNum % 3 === 0) {
            expectedOutput = 'Fizz';
        } else if (currentNum % 5 === 0) {
            expectedOutput = 'Buzz';
        } else {
            expectedOutput = currentNum.toString();
        }

        if (receivedInput !== expectedOutput) {
            playerStatus[currentPlayerIdx] = false;
            activePlayersCount--;
        }

        if (activePlayersCount === 1) {
            break;
        }

        if (iterations === 0) {
            break;
        }

        currentPlayerIdx++;
        if (currentPlayerIdx >= rows) {
            currentPlayerIdx = 0;
        }

        while (playerStatus[currentPlayerIdx] === false) {
            currentPlayerIdx++;
            if (currentPlayerIdx >= rows) {
                currentPlayerIdx = 0;
            }
        }
    }

    var finalSurvivors = [];
    playerStatus.forEach(function (isActive, playerIndex) {
        if (isActive) {
            finalSurvivors.push(playerIndex + 1);
        }
    });

    console.log(finalSurvivors.join(' '));
}
