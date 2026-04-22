/*
 * This is a JavaScript file implementing a specific algorithm.
 * It strictly adheres to ECMAScript 5.1 and later standards.
 */
"use strict";


// Main function definition begins here.
const main = arg =>
{
   // Trim leading/trailing whitespace and split the input string by newlines.
   arg = arg .trim() .split( "\n" );

   // Initialize the character array 'S' from the first line of input.
   let S = arg[0] .split( "" );

   // Parse the second line of input to get the integer 'N'.
   const N = parseInt( arg[1] );

   // Extract the query lines 'Q' from the input, starting from the third line.
   const Q = arg .slice( 2, N + 2 );


   // Loop through each of the 'N' queries.
   for ( let i = 0 ; i < N ; i++ )
   {
      // Split the current query string by spaces to get individual parts.
      const split = Q[i] .split( " " );

      // Check the type of operation based on the length of the split array.
      // If the length is 1, it implies a reversal operation.
      // Original comment: Ti = 1の時、反転 (When Ti = 1, reverse)
      if ( split .length === 1 )
      {
         // Perform the string reversal.
         S = S .reverse();
      }
      else
      {
         // If the second part of the query is "1", unshift the third part to 'S'.
         if ( split[1] === "1" )
         {
            S .unshift( split[2] );
         }
         // Otherwise, push the third part to 'S'.
         else
         {
            S .push( split[2] );
         }
      }
   }


   // After processing all queries, join the characters in 'S' and print the result to console.
   console .log( S .join( "" ) );
}; // End of main function.


// This section handles reading input from stdin and invoking the main function.
main( require( 'fs' ) .readFileSync( '/dev/stdin', 'utf8' ) );
// Script execution finishes here.