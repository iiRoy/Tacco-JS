"use strict"
// This directive enables strict mode for the entire script.

// Main function to process the input
const main =  arg => {
  // Trim whitespace and split the input string by newlines
  arg = arg.trim().split( "\n" ) ;

  // Parse H (height) and W (width) from the first line of input
  const H = parseInt( arg[0].split(" ")[0] ) ;
  const W = parseInt( arg[0].split(" ")[1] ) ;

  // Parse N (number of colors) from the second line
  const N = parseInt( arg[1] ) ;
  // Parse array A (counts for each color) from the third line
  const A = arg[2].split(" ").map( n => parseInt( n ) ) ;

  let temp = []; // Temporary array to store expanded color values

  // Special case: if the grid is 1x1, just print 1
  if ( H * W === 1 ) {
    console.log( 1 ) ;
    return ; // Exit the function early
  }

  // Populate the 'temp' array based on N and A
  // For each color 'i' from 1 to N
  for ( let i = 1 ; i <= N ; i++ ) {
    // Add the color 'i' to 'temp' A[i-1] times
    for ( let j = 0 ; j < A[i-1] ; j++ ) {
      temp.push( i ) ;
    }
  }

  let answer = [] ; // Stores the final rows of the grid
  let list = [] ; // Temporary list to build a single row

  // Iterate through the 'temp' array to form the grid rows
  for ( let i = 0 ; i < temp.length ; i++ ) {
    list.push( temp[i] ) ; // Add current color to the row

    // Check if a row is complete (i.e., W elements have been added)
    // Also ensures this isn't the very first element (i !== 0)
    if ( i !== 0 && ( parseInt(i) + 1 ) % W === 0 ) {

      // If the row index is odd, reverse the row for snake-like pattern
      if ( i % 2 !== 0 ) {
        list.reverse() ;
      }

      // Add the completed row (joined by spaces) to the answer
      answer.push( list.join( " " ) ) ;
      list = [] ; // Reset the current row list
    }
  }

  // Print the final answer, with rows joined by newlines
  console.log( answer.join( "\n" ) ) ;
}
// Read input from stdin, convert to UTF-8, and pass to main function
main( require( 'fs' ).readFileSync( '/dev/stdin' , 'utf8' ) ) ;