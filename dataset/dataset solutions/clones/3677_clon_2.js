'use strict'

 const performEvaluation = ( rawTextualData ) => {
  const tokenizedSections = rawTextualData.split ( '\n' ) .map ( sectionEntry => sectionEntry.split ( ' ' ) )
  const numericValueA = parseInt ( tokenizedSections [ 0 ] [ 0 ] , 10 )
  const numericValueB = parseInt ( tokenizedSections [ 0 ] [ 1 ] , 10 )
  if ( numericValueA + numericValueB === 15 ) {
    console.log ( '+' )
  }
  else if ( numericValueA * numericValueB === 15 ) {
    console.log ( '*' )
  }
  else {
    console.log ( 'x' )
  }
 }

performEvaluation( require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' }) )