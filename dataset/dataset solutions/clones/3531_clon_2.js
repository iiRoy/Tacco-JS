"use strict";

const performAnalysis = rawInputData => {
    rawInputData = rawInputData.  trim().split( "\n" );
    const stringAlpha = rawInputData[0];
    const stringBeta = rawInputData[1];

    const charCountsA = (new Array(26)).fill(0);
    const charCountsB = Array.from({length: 26}, () => 0);

    for ( let charIndex = 0; charIndex < stringAlpha.length; charIndex++ ) {
        charCountsA[stringAlpha.charCodeAt(charIndex) - 97]++;
        charCountsB[stringBeta.charCodeAt(charIndex) - 97]++;
    }

    charCountsA.sort( ( valueOne, valueTwo ) => valueOne - valueTwo );
    charCountsB.sort( ( valueOne, valueTwo ) => valueOne - valueTwo );

    if ( charCountsA.join("") === charCountsB.join("") ) {
        console.log( "Yes" );
    }
    else {
        console.log( "No" );
    }
};

performAnalysis( require('fs').readFileSync( '/dev/stdin', 'utf8' ) );