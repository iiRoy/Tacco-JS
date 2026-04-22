'use strict' ;

// Core Logic Block
function decryptShiftCipher( encodedMessage )
{
  let decodedOutput = '' ;

  // charValue stores the numeric representation of the current character
  let charValue ;

  for ( let idx = 0 ; idx < encodedMessage.length ; idx ++ )
  {
    charValue = encodedMessage.charCodeAt( idx ) - 3 ;

    if ( charValue < 65 )
    {
      charValue += 26 ;
    }

    decodedOutput += String.fromCharCode( charValue ) ;
  }

  return decodedOutput ;
}

// Input/Output Operations (Direct)
/*
 This section demonstrates an alternative input method, typically for interactive console applications.
 It is commented out to use file-based input for this specific script.
*/
// require('readline').createInterface({
//   input: process.stdin,
//   output: process.stdout
// }).on('line', (inputData) => console.log(decryptShiftCipher(inputData.trim())));


require('fs')
  .readFileSync( '/dev/stdin', 'utf8' )
  .trim()
  .split( '\n' )
  .forEach(
    function ( inputLine ) {
      console.log( decryptShiftCipher( inputLine ) ) ;
    }
  ) ;