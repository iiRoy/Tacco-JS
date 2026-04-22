var dataSource = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineBuffer = ( dataSource.trim() ).split("\n");

while ( true ) {
    var currentParams = lineBuffer.shift();

    if ( currentParams === "0 0" ) {
        break;
    }

    currentParams = currentParams.split(" ").map(Number);
    var playerCount = currentParams[0];
    var initialResource = currentParams[1];

    var playerScores = [];
    for ( var iteration = 0; iteration < playerCount; iteration++ ) {
        playerScores.push(0);
    }

    var activePlayerIndex = 0;

    for ( var gameTurn = 0; gameTurn < 1000000; gameTurn++ ) {
        if ( activePlayerIndex === playerScores.length ) {
            activePlayerIndex = 0;
        }

        if ( initialResource > 0 ) {
            initialResource--;
            playerScores[activePlayerIndex]++;
            if ( initialResource === 0 ) {
                var totalScore = playerScores.reduce(function(accumulator, currentValue){
                    return accumulator + currentValue;
                });
                if ( ( totalScore - playerScores[activePlayerIndex] ) === 0 ) {
                    console.log(activePlayerIndex);
                    break;
                }
            }
        } else {
            initialResource = playerScores[activePlayerIndex];
            playerScores[activePlayerIndex] = 0;
        }
        activePlayerIndex++;
    }
}