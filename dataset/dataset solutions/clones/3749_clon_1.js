"use strict" ;

/*
 * This JavaScript file defines a main function
 * to process input data based on specific conditions.
 * It's designed for execution in a Node.js environment
 * reading from standard input.
 */

const main =  ( arg )  =>
{
  // First, clean up the input string: remove outer whitespace
  // and then split it into an array of lines.
  arg   =   arg.trim() .split( "\n" ) ;

  // From the first line of the input,
  // extract two integer values: D and N.
  // These are parsed from space-separated parts.
  const   D   =   parseInt( arg[0].split( " " )[0] ) ;
  const   N   =   parseInt( arg[0].split( " " )[1] ) ;

  // The following lines are commented out. They might represent
  // experimental code or previous debugging efforts.
  // let temp = [ ... Array ( D * 2 ) ].fill( 0 ) ;
  // console.log ( N + String ( temp.join ( "" ) ) ) ;


  // Evaluate the value of D and perform actions accordingly.

  // Case 1: If D is exactly 0.
  if  ( D  ===  0 )
  {
    // Output the value of N directly.
    console.log( N ) ;
    return ; // Terminate function execution.
  }

  // Case 2: If D is exactly 1.
  if  ( D  ===  1 )
  {
    // Output N concatenated with "00".
    console.log( N  +  "00" ) ;
    return ; // Terminate function execution.
  }

  // Case 3: If D is exactly 2.
  if  ( D  ===  2 )
  {
    // Output N concatenated with "0000".
    console.log( N  +  "0000" ) ;
    return ; // Terminate function execution.
  }

} ;

// This block executes the main function.
// It reads the entire content of '/dev/stdin' as a UTF-8 string
// and passes it as an argument to the main function.
main ( require( 'fs' ) .readFileSync ( '/dev/stdin' ,  'utf8' ) ) ;