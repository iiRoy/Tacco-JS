var sourceContent = require('fs').readFileSync('/dev/stdin', 'utf8');

var dataRows = ( sourceContent .trim() ) .split( "\n" );

while ( true ) {
    var currentRoundParamsStr = dataRows.shift();

    if ( currentRoundParamsStr === "0 0" ) {
        break;
    }

    currentRoundParamsStr = currentRoundParamsStr.split(" ").map(Number);

    var participantCount = currentRoundParamsStr[0];
    var dealerStones = currentRoundParamsStr[1];

    var initialTotalStones = dealerStones;
    var playerPiles = [];

    for ( var participantIndex = 0; participantIndex < participantCount; participantIndex++ ) {
        playerPiles.push(0);
    }

    var activeParticipantIdx = 0;

    for ( var simulationStep = 0; simulationStep < 1000000; simulationStep++ ) {
        if ( activeParticipantIdx === playerPiles.length ) {
            activeParticipantIdx = 0;
        }

        if ( dealerStones > 0 ) {
            dealerStones--;
            playerPiles[activeParticipantIdx]++;

            if ( dealerStones === 0 && initialTotalStones === playerPiles[activeParticipantIdx] ) {
                console.log(activeParticipantIdx);
                break;
            }
        } else {
            dealerStones = playerPiles[activeParticipantIdx];
            playerPiles[activeParticipantIdx] = 0;
        }
        activeParticipantIdx++;
    }
}