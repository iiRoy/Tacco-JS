/*
 * This module processes character codes from standard input
 * and generates a specific output sequence.
 */

var diskOps = require( 'fs' ) ,
    fileSize = diskOps.fstatSync( process.stdin.fd ).size ,
    dataBuffer = new Buffer( fileSize ) ,
    octetsReceived = diskOps.readSync( process.stdin.fd , dataBuffer , 0 , fileSize , 0 ) ,
    textLines = dataBuffer.toString( 'utf8' , 0 , octetsReceived ).split( '\n' ) ;

executeCoreLogic();

function executeCoreLogic()
{
  var inputString = textLines[ 0 ] ,
      resultSequence = '' ,
      idx , strLength , loopVar , codeDifference , integerSqrt , signChar ,
      previousCode = 0 ,
      thresholdValue = 0x10 , // Hexadecimal for 16
      characterCodeArray = [ ] ;

  // Populate an array with character codes from the input string.
  for ( idx = 0 , strLength = inputString.length ; idx < strLength ; idx++ )
  {
    characterCodeArray[ idx ] = inputString.charCodeAt( idx ) ;
  }

  // Iterate through the character codes to build the output sequence.
  for ( idx = 0 ; idx < strLength ; previousCode = characterCodeArray[ idx ] , idx++ )
  {
    codeDifference = characterCodeArray[ idx ] - previousCode ;
    signChar = codeDifference > 0 ? '+' : '-' ;
    codeDifference = Math.abs( codeDifference ) ;

    if ( codeDifference < thresholdValue )
    {
      for ( loopVar = codeDifference ; loopVar > 0 ; loopVar-- )
      {
        resultSequence += signChar ;
      }
    }
    else
    {
      integerSqrt = ~~ Math.sqrt( codeDifference ) ;
      resultSequence += '>' ;

      for ( loopVar = integerSqrt ; loopVar > 0 ; loopVar-- )
      {
        resultSequence += '+' ;
      }

      resultSequence += '[<' ;

      for ( loopVar = integerSqrt ; loopVar > 0 ; loopVar-- )
      {
        resultSequence += signChar ;
      }

      resultSequence += '>-]<' ;

      for ( loopVar = codeDifference - integerSqrt * integerSqrt ; loopVar > 0 ; loopVar-- )
      {
        resultSequence += signChar ;
      }
    }
    resultSequence += '.' ;
  }

  console.log( resultSequence ) ;
}