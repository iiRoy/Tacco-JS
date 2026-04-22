"use strict" ;
const ExecuteProgram = ( sourceContent ) => {
  let lineFragments = sourceContent.  trim()
                                .split( '\n' ) ;
  let firstNumberArray = lineFragments[ 0 ] .trim() .split( '' ) .map( charDigit => Number( charDigit ) ) ;
  let secondNumberArray = lineFragments[ 1 ] .trim() .split( '' ) .map( charDigit => Number( charDigit ) ) ;
  let lengthFirst = firstNumberArray.length ;
  let lengthSecond = secondNumberArray.length ;
  let sumFirstDigits = 0 ;
  for ( let currentIdx = 0 ; currentIdx < lengthFirst ; currentIdx ++ ) {
    sumFirstDigits += firstNumberArray[ currentIdx ] ;
  }
  let sumSecondDigits = 0 ;
  for ( let iterationIndex = 0 ; iterationIndex < lengthSecond ; iterationIndex ++ ) {
    sumSecondDigits += secondNumberArray[ iterationIndex ] ;
  }
  if ( sumFirstDigits > sumSecondDigits ) {
    console .log( 'GREATER' ) ;
  } else {
    console .log( 'LESS' ) ;
  }
} ;
ExecuteProgram( require( 'fs' ) .readFileSync( '/dev/stdin' , 'utf8' ) ) ;