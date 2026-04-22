const dataLines = require ( 'fs' ) . readFileSync ( '/dev/stdin', 'utf-8' )
  . split ( '\n' ) ; // Obtain all input lines from standard input.

const [ valA, valB ] = dataLines [ 0 ] . split ( ' ' ) . map ( Number ) ; // Extract and convert the first two numbers from the initial line.

let outcomeIndicator = 'No' ; // Set a default result string.

if ( valA < valB ) { // Begin evaluating the primary condition.
  const interimResult = ( valB - valA * 2 ) / 2 ; // Compute an intermediate numerical value.

  if ( interimResult <= valA ) { // Assess a secondary condition using the interim result.
    outcomeIndicator = 'Yes' ; // Modify the result if the secondary condition is satisfied.
  }
}

console . log ( outcomeIndicator ) ; // Output the determined result to the console.