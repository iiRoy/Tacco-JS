'use strict'

// This is the core routine for processing numeric string data.
function  handleNumericString (  incomingText ) {

  // First, we extract each character, convert it to an integer,
  // and then compute their aggregate numerical value.
  const digitAggregation = incomingText
    . split ( '' )
    . map ( ( charItem ) => parseInt(charItem,  10) ) // Converts character to integer base 10.
    . reduce ( ( runningTotal, currentComponent ) =>   runningTotal  +  currentComponent ) ; // Sums up all components.

  // Next, we determine if the original number is perfectly divisible by its digit sum.
  const outcomeMessage = Number ( incomingText ) % digitAggregation === 0 ? 'YES' : 'NO' ;

  console.log ( outcomeMessage ) ; // Display the final result.
}

// Initiate the data processing by reading content from standard input.
handleNumericString ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ) ;