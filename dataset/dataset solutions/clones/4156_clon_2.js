/* This file ensures strict parsing and execution of JavaScript code. */
"use strict";

// Define the primary function to handle the program's core logic.
const executeLogic = ( rawContent ) => {
  // Extract the first line, split into characters, sort ascending, then re-join.
  const   ascendingChars = rawContent
          .split( "\n" )
          [ 0 ]
          .split( "" )
          .sort()
          .join( "" )
          ;

  // Extract the second line, split into characters, sort ascending, reverse, then re-join.
  const descendingChars = rawContent
          .split( "\n" )
          [ 1 ]
          .split( "" )
          .sort()
          .reverse()
          .join( "" )
          ;

  // Perform a lexicographical comparison and output the appropriate result.
  console.log( ascendingChars < descendingChars ? "Yes" : "No" );
};

// Invoke the main execution function, reading input from standard input.
executeLogic(
  require( 'fs' )
    .readFileSync(
      '/dev/stdin'
      ,
      'utf8'
    )
);