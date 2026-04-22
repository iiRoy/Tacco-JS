/*
 * This is a JavaScript function named Main.
 * It processes input data to perform some calculations.
 * The 'use strict' directive is used for stricter parsing and error handling.
 */
function Main ( input ) {
  'use strict' ; // Enable strict mode for better code quality.


  // Split the input string by newline characters into an array of strings.
  const temp = input . split ( "\n" ) ;
  // Parse the first element of 'temp' as an integer and store it in 'n'.
  // This element is removed from 'temp' using shift().
  const n = parseInt ( temp . shift ( ) ) ;

  // Initialize two empty arrays to store calculated values.
  const arr = [ ] ;
  const arrReverse = [ ] ;

  // Loop through the first 'n' elements of 'temp'.
  // For each element, split it by spaces.
  for ( let i = 0 ; i < n ; i ++ ) {
    temp [ i ] = temp [ i ] . split ( " " ) ;
  }


  // Nested loops to iterate through pairs of elements from 'temp'.
  // This calculates differences between coordinates.
  for ( let i = 0 ; i < n - 1 ; i ++ ) {
    for ( let j = i + 1 ; j < n ; j ++ ) {
      // Calculate differences for 'arr'
      arr . push ( [ temp [ i ] [ 0 ] - temp [ j ] [ 0 ] , temp [ i ] [ 1 ] - temp [ j ] [ 1 ] ] ) ;
      // Calculate differences for 'arrReverse'
      arrReverse . push ( [ temp [ j ] [ 0 ] - temp [ i ] [ 0 ] , temp [ j ] [ 1 ] - temp [ i ] [ 1 ] ] ) ;
    }
  }

  // Sort both arrays. Default sort is lexicographical for arrays of numbers,
  // which works for pairs like [x,y].
  arr . sort ( ) ;
  arrReverse . sort ( ) ; // Sort the reversed differences array.


  // Initialize 'm' (current consecutive count) and 's' (maximum consecutive count).
  let m = 1 ;
  let s = 0 ;

  // Loop through the sorted array to find the longest sequence of identical or reverse-identical pairs.
  for ( let i = 0 ; i < arr . length - 1 ; i ++ ) {
    // Compare current element with the next in 'arr' and with the next in 'arrReverse'.
    // JSON.stringify is used for deep comparison of array contents.
    if ( JSON . stringify ( arr [ i ] ) == JSON . stringify ( arr [ i + 1 ] ) ||
         JSON . stringify ( arr [ i ] ) == JSON . stringify ( arrReverse [ i + 1 ] ) )
    {
      m ++ ; // Increment current count if a match is found.
    }
    else
    {
      // If no match, check if current count 'm' is greater than max count 's'.
      if ( s < m ) {
        s = m ; // Update max count.
      }
      m = 1 ; // Reset current count for the next sequence.
    }
  }

  // Output the final result.
  // The problem statement implies `n - s` is the desired output.
  console . log ( n - s ) ;
}


// ********************************************************************************
// * This line and below are for handling standard input/output.                  *
// * Do not modify anything from this point onwards as per original instructions. *
// * It reads the entire content from stdin and passes it to the Main function.   *
// ********************************************************************************
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;