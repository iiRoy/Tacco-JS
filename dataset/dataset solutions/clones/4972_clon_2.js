"use strict";


const processInput = (rawData) => {
    rawData = rawData.trim()
                     .split('\n');

    const firstQueue = rawData[0] . split('');
    const secondQueue = rawData[1] . split('');
    const thirdQueue = rawData[2] . split('');

    let currentTurnMarker = 'alpha';

    while ( true ) {

        if ( currentTurnMarker === 'alpha' ) {
            if ( firstQueue.length === 0 ) {
                console.log( 'Alpha' );
                return;
            }

            currentTurnMarker = firstQueue.shift();
        } else if ( currentTurnMarker === 'beta' ) {
            if ( secondQueue.length === 0 ) {
                console.log( 'Beta' );
                return;
            }

            currentTurnMarker = secondQueue.shift();
        } else if ( currentTurnMarker === 'gamma' ) {
            if ( thirdQueue.length === 0 ) {
                console.log( 'Gamma' );
                return;
            }

            currentTurnMarker = thirdQueue.shift();
        }
    }
};

processInput(
    require('fs')
        .readFileSync('/dev/stdin', 'utf8')
);