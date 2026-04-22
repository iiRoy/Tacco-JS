// Retrieve the raw input data from the standard input stream.
let inputData = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . split ( '\n' );

// Extract the primary numerical value from the input sequence.
const primaryNum = Number ( inputData . shift ( ) );

// Retrieve the first numerical component for subsequent calculation.
const firstVal = Number ( inputData . shift ( ) );

// Fetch the second numerical component for arithmetic operations.
const secondVal = Number ( inputData . shift ( ) );

// Display the computed result or a greeting, contingent on the main numeric input.
console . log ( primaryNum === 1 ? 'Hello World' : ( firstVal + secondVal ) );