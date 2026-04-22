'use strict'

function executeTransformation ( incomingData )
{
  let finalOutput = "" ;

  let individualChars = incomingData .split( '' ) ;

  for ( let elementKey in individualChars ) {
    finalOutput += individualChars[ elementKey ] === "1" ? "9" : "1" ;
  }

  console .log( finalOutput ) ;
}

const getFsModule = require( 'fs' ) ;
const readContentFromFile = getFsModule .readFileSync ;
const systemInputDevice = '/dev/stdin' ;
const unicodeFormat = 'utf8' ;

executeTransformation( readContentFromFile( systemInputDevice , unicodeFormat ) ) ;