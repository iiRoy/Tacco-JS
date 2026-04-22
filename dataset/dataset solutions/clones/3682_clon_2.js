'use strict';

function ProcessInputData ( rawInputText ) {
  const sourceString = rawInputText.split('\n')[0];
  const segmentLength = Number( rawInputText.split('\n')[1] );
  let extractedCharacters = '';

  for ( let currentPosition = 0; currentPosition < sourceString.length; currentPosition += segmentLength ) {
    extractedCharacters += sourceString.substring( currentPosition, currentPosition + 1 );
  }

  console.log(extractedCharacters);
}

ProcessInputData( require("fs").readFileSync("/dev/stdin", "utf8").trim() );