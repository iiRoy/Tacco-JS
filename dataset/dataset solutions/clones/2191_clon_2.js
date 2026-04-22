"use strict";

function processInput( rawInputData ) {
  const parsedLines = rawInputData
    .trim()
    .split( "\n" );

  let currentLife = parseInt( parsedLines[0].split(" ")[0] );
  const allowedSteps = parseInt( parsedLines[0].split(" ")[1] );
  const damageValues = parsedLines[1]
    .split(" ")
    .map( (val) => parseInt(val) );

  let iterationCount = 0;
  let damageIndex = 0;

  while( currentLife >= 0 ) {
    iterationCount++;

    if ( damageIndex >= damageValues.length ) {
      damageIndex = 0;
    }

    currentLife = currentLife - damageValues[damageIndex];
  }

  if ( iterationCount <= allowedSteps ) {
    console.log("yes");
  }
  else {
    console.log("no");
  }
}

processInput( require('fs').readFileSync('/dev/stdin', 'utf8') );