/*
 * This is a JavaScript file demonstrating strict mode.
 * The 'use strict' directive helps to write cleaner and safer code.
 */
'use strict'
;

// This function determines if three given lengths can form a "good" triangle.
// A good triangle must satisfy the triangle inequality and have distinct side lengths.
function isGoodTriangle ( l )
{
  // Sort the array of lengths in descending order.
  // This simplifies checking the triangle inequality.
  l . sort( ( a , b ) => b   -   a );

  // The condition for a "good" triangle:
  // 1. Triangle inequality: The sum of the two shorter sides must be greater than the longest side.
  //    Since l is sorted descending, l[0] is the longest. So, l[0] < l[1] + l[2].
  //    This can be rewritten as l[0] - l[1] < l[2].
  // 2. All side lengths must be distinct (l[0] !== l[1] && l[1] !== l[2]).
  return l [ 0 ]   -   l [ 1 ]   <   l [ 2 ]   &&   l [ 0 ]   !==   l [ 1 ]   &&   l [ 1 ]   !==   l [ 2 ] ;
}


// The main function that processes input and calculates the result.
function Main(inputs) {

  // The input string is provided.
  // It contains multiple lines, separated by newline characters.
  // input[0] will be the first line, input[1] the second, and so on.
  const input = inputs . split ( "\n" ) ;

  // The first line of input represents the number of available lengths (n).
  const n = Number ( input [ 0 ] ) ;

  // The second line of input contains space-separated lengths (l).
  // These are parsed into an array of numbers.
  const l = input [ 1 ] . split ( ' ' ) . map ( Number ) ;

  // Initialize a counter for "good" triangles found.
  let num = 0 ;

  // Iterate through all possible combinations of three distinct lengths.
  // We use three nested loops to select unique indices a, b, and c.
  // 'a' starts from the first element.
  for ( let   a   =   0 ;   a   <   n ;   a ++ )
  {
    // 'b' starts from the element after 'a' to ensure distinctness and avoid duplicates.
    for ( let   b   =   a   +   1 ;   b   <   n ;   b ++ )
    {
      // 'c' starts from the element after 'b' for the same reasons.
      for ( let   c   =   b   +   1 ;   c   <   n ;   c ++ )
      {
        // Check if the current combination of lengths forms a "good" triangle.
        if ( isGoodTriangle ( [ l [ a ] , l [ b ] , l [ c ] ] ) )
        {
          // If it is a good triangle, increment the counter.
          num ++ ;
        }
      }
    }
  }

  // Output the total number of good triangles found to the console.
  console . log ( num ) ;
}


/*
 * DO NOT MODIFY THE FOLLOWING LINES OF CODE.
 * This section handles standard input/output operations.
 * It reads the entire input from stdin and passes it to the Main function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;