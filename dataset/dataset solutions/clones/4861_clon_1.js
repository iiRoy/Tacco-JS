/*
 * This JavaScript program processes a grid of words to locate a specific target word,
 * "snuke", and reports its 1-based column (represented by a letter from the alphabet)
 * and its 1-based row number. The input is expected to be provided via standard input.
 */

"use strict" ; /* This directive enables strict mode for the entire script,
                 * enforcing stricter parsing and error handling rules. */


const  main  =  arg  =>   {

  // Pre-process the raw input string:
  // 1. Remove any leading or trailing whitespace.
  // 2. Split the string into an array of individual lines.
  arg = arg . trim ( ) . split ( "\n" ) ;


  // The first line of the input contains the grid dimensions (Height and Width).
  // Split this line by space to get the two dimension values.
  const H = parseInt ( arg [ 0 ] . split ( " " ) [ 0 ] ) ; // Parse the height (number of rows).
  const W = parseInt ( arg [ 0 ] . split ( " " ) [ 1 ] ) ; // Parse the width (number of columns).


  // Extract the actual grid of words from the input.
  // - Use `slice` to skip the first line (which contains H and W).
  // - `map` each subsequent line to an array of words by splitting it by space.
  const words = arg . slice ( 1 , H + 1 ) . map ( s => s . split ( " " ) ) ;


  // Define the alphabet array, which will be used to convert 0-based column indices
  // into their corresponding alphabetical representations (A, B, C, ...).
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" . split ( "" ) ;


  // Begin a nested loop to iterate through each cell (word) in the grid.
  // The outer loop iterates through rows (from 0 to H-1).
  for ( let i = 0 ; i < H ; i ++ )
  {
    // The inner loop iterates through columns for the current row (from 0 to W-1).
    for ( let j = 0 ; j < W ; j ++ )
    {
      // Check if the word at the current grid position [i][j] is exactly "snuke".
      if ( words [ i ] [ j ] === "snuke" )
      {
        // If "snuke" is found:
        // - Get the alphabetical representation for the column `j` (0-based).
        // - Convert the row index `i` (0-based) to a 1-based integer.
        // - Concatenate these two parts and print the result to the console.
        console . log ( alpha [ j ] + ( parseInt ( i ) + 1 ) ) ;

        // Since we only need to find the first occurrence, exit the function immediately.
        return ;
      }
    }
  }

} /* End of the main function definition. */


// This line reads the entire content of standard input (`/dev/stdin`) as a UTF-8 string,
// and then passes that string as an argument to the `main` function to begin execution.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;