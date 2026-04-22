'use strict';
(function(rawData) {
    rawData = rawData.trim()
                     .split( /\s+/ )
                     .map( val => val - 0 );

    const moveCount = rawData.shift();
    const initialStones = rawData.shift();
    const allowedMoves = rawData;

    const gameStates = new Array(initialStones + 2).fill('unknown');
    
    gameStates[initialStones + 1] = true;

    for (let currentPile = initialStones + 1; currentPile >= allowedMoves[0]; currentPile--) {
        if (gameStates[currentPile]) {
            if (gameStates[currentPile - 1] === true) {
                continue;
            }
            for (let tempMove = 1; tempMove <= allowedMoves[0]; tempMove++) {
                if (currentPile - tempMove >= 0) {
                    if (gameStates[currentPile - tempMove] === 'unknown') {
                        gameStates[currentPile - tempMove] = false;
                    }
                }
            }
        }

        if (!gameStates[currentPile]) {
            for (let moveIndex = 0; moveIndex < moveCount; moveIndex++) {
                if (currentPile - allowedMoves[moveIndex] >= 0) {
                    gameStates[currentPile - allowedMoves[moveIndex]] = true;
                }
            }
        }
    }
    
    if (gameStates[0] === true) {
        console.log('First');
    } else {
        console.log('Second');
    }
})( require('fs').readFileSync('/dev/stdin', 'utf8') );