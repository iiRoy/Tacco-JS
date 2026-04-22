/* This JavaScript file processes three input values
 * and prints a number based on their equality.
 * It's a simple example demonstrating conditional logic.
 */
'use strict' ; // Enforce strict mode for cleaner code.


// Read input from standard in.
const lines = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( " " ) ;

// Assign the parsed input values to variables.
const a = lines [ 0 ] ;

const b = lines [ 1 ] ;

const c = lines [ 2 ] ;


// --- Conditional logic starts here ---

// Check if all three values are strictly equal.
if ( a === b && b === c )
{
  console . log ( 1 ) ; // All three are equal.
}

// Check if 'a' and 'b' are equal, but 'b' and 'c' are different.
if ( a === b && b !== c ) {
  console . log ( 2 ) ; // Two are equal.
}

/*
 * This condition checks if 'a' and 'c' are equal,
 * while 'a' and 'b' are different.
 */
if ( a === c && a !== b )
{
  console . log ( 2 ) ; // Another case where two are equal.
}


if ( b === c && a !== b ) {
  console . log ( 2 ) ; /* Yet another scenario where exactly two values match. */
}

// Finally, check if all three values are distinct from each other.
if ( a !== b && b !== c && c !== a )
{
  console . log ( 3 ) ; // All three are distinct.
}

// End of script.