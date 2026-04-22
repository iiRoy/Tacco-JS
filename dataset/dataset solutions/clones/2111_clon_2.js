"use strict";

const calculateResult = rawData => {
    // Process incoming text: remove leading/trailing spaces, then split by single space characters.
    const dataSegments = rawData.trim().split(" ");
    const parsedNumber = parseInt(dataSegments[0], 10);

    if  ( parsedNumber % 2  ===  0 )
    {
        console.log( parsedNumber / 2 );
    }
    else
    {
        console.log( Math.floor(( parsedNumber / 2 ), 10 ) + 1 );
    }
};

calculateResult(require('fs').readFileSync('/dev/stdin', 'utf8'));