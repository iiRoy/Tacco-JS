/*
 * This is a JavaScript file implementing a simple word counter and scorer.
 * It processes input from standard input.
 * The 'use strict' directive enforces stricter parsing and error handling.
 */
'use strict'

// Main function to process the input string
function main( s )
{

  /*
   * The input string 's' is expected to be multiline.
   * We split it by newline characters to get an array of lines.
   */
  s = s . split( '\n' ) ;


  // The first line contains the number N, which is parsed as an integer.
  const N = Number( s[ 0 ] ) ;

  // 'blue' array contains N elements starting from the second line (index 1).
  const blue = s . slice( 1 , 1 + N ) ;

  /*
   * 'red' array contains elements starting from line N + 2 until the end.
   * The -1 in slice indicates to go up to the last element, excluding it.
   */
  const red = s . slice( N + 2 , -1 ) ;

  // Initialize an empty array to store point objects.
  const points = [ ] ;


  /*
   * Process the 'blue' array.
   * For each element 'x', we check if it's the first occurrence.
   * If it is, a new point object is created with count 1.
   * Otherwise, the count for the existing point object is incremented.
   */
  blue . forEach( ( x , i , self ) =>
  {
    // Check if this is the first occurrence of 'x' in 'self' (the blue array)
    if ( self . indexOf( x ) === i )
    {
      // If it's a new unique item, push a new point object
      points . push( { key : x , count : 1 } ) ;
    }
    else
    {
      // If the item already exists, find it in 'points' and increment its count
      points . forEach( y =>
      {
        if ( x === y . key ) y . count += 1
      } ) ;
    }
  } ) ;


  /*
   * Process the 'red' array.
   * For each element 'x' in 'red', we find the corresponding point object
   * and decrement its count.
   */
  red . forEach( ( x ) =>
  {
    // Iterate through the 'points' array
    points . forEach( y =>
    {
      // If the key matches, decrement the count
      if ( x === y . key ) y . count -= 1
    } ) ;
  } ) ;


  // Sort the 'points' array in descending order based on the 'count' property.
  points . sort( ( a , b ) => b . count - a . count ) ;


  /*
   * Calculate the final answer.
   * If the count of the top-ranked point (points[0]) is non-negative,
   * that count is the answer. Otherwise, the answer is 0.
   */
  const ans = ( points[ 0 ] . count >= 0 ) ? points[ 0 ] . count : 0 ;

  // Output the final answer to the console.
  console . log( ans ) ;
}

/*
 * This is the entry point for execution.
 * It reads the entire content of standard input as a UTF-8 string
 * and passes it to the 'main' function.
 */
main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;