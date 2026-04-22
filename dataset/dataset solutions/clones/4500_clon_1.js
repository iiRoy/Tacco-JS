// This file contains a JavaScript program designed to process input data.
// It adheres to strict mode for better error handling and performance.
"use strict" ; // Enforces strict parsing and error handling rules.

/*
 * The 'main' function serves as the entry point for processing the input.
 * It takes a single argument, 'arg', which is expected to be a string.
 */
const main =   arg   =>   {
  // First, we prepare the input string.
  // We remove leading/trailing whitespace and split it into an array of lines.
  arg   =   arg . trim ( ) . split ( "\n" ) ;

  /*
   * The first line of the input (arg[0]) is converted to an integer.
   * The '~~' operator is a concise way to perform a bitwise NOT operation twice,
   * effectively truncating the number to an integer and handling non-numeric values as 0.
   */
  const   N   =   ~~ arg [ 0 ] ;

  // The second line of the input (arg[1]) is processed.
  // It's split by spaces, and each part is converted to an integer.
  const   b   =   arg [ 1 ] . split ( " " ) . map (   n   =>   ~~ n   ) ;

  // Initialize an empty array to store the result.
  let   answer   =   [ ] ;

  // Based on whether N is even or odd, we apply different processing logic.
  if   (   N   %   2   ===   0   )   {
    // Case 1: N is an even number.
    // We iterate backwards, taking every second element from 'b', starting from N-1.
    for   (   let   i   =   N   -   1   ;   i   >   0   ;   i   -=   2   )   {
      answer . push ( b [ i ] ) ; // Add the element to our answer array.
    }

    // After the first loop, we then iterate forwards, taking every second element from 'b', starting from 0.
    for   (   let   i   =   0   ;   i   <   N   ;   i   +=   2   )   {
      answer . push ( b [ i ] ) ; // Append the element.
    }
  }   else   {
    // Case 2: N is an odd number.
    // Similar to the even case, but the loop conditions and starting points differ slightly.
    // Iterate backwards, taking every second element, starting from N-1 down to 0.
    for   (   let   i   =   N   -   1   ;   i   >=   0   ;   i   -=   2   )   {
      answer . push ( b [ i ] ) ;
    }

    // Then, iterate forwards, taking every second element, starting from 1.
    for   (   let   i   =   1   ;   i   <   N   ;   i   +=   2   )   {
      answer . push ( b [ i ] ) ;
    }
  }

  // Finally, join the elements of the 'answer' array with spaces and print to the console.
  console . log (   answer . join ( " " )   ) ;
}

// The program execution starts here.
// It reads input from standard input (/dev/stdin) using Node.js 'fs' module.
// The input is read as UTF-8 and then passed to the 'main' function.
main   (   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )   ) ;

// End of JavaScript program.