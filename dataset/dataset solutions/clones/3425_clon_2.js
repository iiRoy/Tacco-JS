'use strict'
;

const obtainedInputData = require('fs')
    .readFileSync('/dev/stdin', 'utf8')
      .split( /\s/ );

const executeProcessor = ( inputSegments ) => {
  const mainStringContent = inputSegments[0]
  ;
  let stringTriplets = [];
  // Iterate through the primary string to extract three-character segments
  for ( let currentPos = 0, upperLimit = mainStringContent.length - 2; currentPos < upperLimit; currentPos++ ) {
    stringTriplets.push( mainStringContent.substr( currentPos, 3 ) )
    ; // console.debug(stringTriplets); // A commented-out debug line for checking extracted parts
  }

  const nearestValue = stringTriplets.reduce( (previousNum, currentNum) =>
    Math.abs( previousNum - 753 ) < Math.abs( currentNum - 753 ) ? previousNum : currentNum
  )
  ;
  const finalCalculatedDifference = Math.abs( nearestValue - 753 );

  console.log( finalCalculatedDifference );
};

executeProcessor( obtainedInputData );