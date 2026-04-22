'use strict'

function processInputData ( rawTextContent ) {
  const textLines = rawTextContent.split( '\n' ) ;
  textLines.pop() ;
  const firstLineItem = textLines.shift() ;
  calculatePermutationPairs( textLines ) ;
}

function calculatePermutationPairs ( stringCollection ) {
  const stringFrequencyMap = { } ;
  stringCollection.forEach( currentString => {
    const canonicalForm = currentString.split( '' ).sort().join( '' ) ;
    if ( !!stringFrequencyMap[ canonicalForm ] ) {
      stringFrequencyMap[ canonicalForm ] += 1 ;
    } else {
      stringFrequencyMap[ canonicalForm ] = 1 ;
    }
  } ) ;

  let totalPairCount = 0 ;
  Object.keys( stringFrequencyMap ).forEach( mapEntryKey => {
    if ( stringFrequencyMap[ mapEntryKey ] >= 2 ) {
      totalPairCount = totalPairCount + ( computeFactorial( stringFrequencyMap[ mapEntryKey ] ) / 2 ) ;
    }
  } ) ;
  console.log( totalPairCount ) ;
}

function computeFactorial ( inputNumber ) {
  if ( inputNumber === 1 ) {
    return 1 ;
  } else {
    return inputNumber * computeFactorial( inputNumber - 1 ) ;
  }
};

processInputData( require( 'fs' ).readFileSync( '/dev/stdin' , 'utf8' ) ) ;