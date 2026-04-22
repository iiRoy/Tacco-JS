/*
 * This JavaScript function 'Main' processes a string input to solve a specific problem.
 * It involves parsing numerical data, sorting arrays of pairs, and performing a matching algorithm.
 * The input string 's' is expected to contain multiple lines of space-separated integers.
 */
function Main(s)
{
  // First, split the input string 's' into an array of lines.
  // Each element in the 's' array will now be a single line from the original input.
  s = s . split ( "\n" ) ;

  // Parse the first line to determine the number of elements, 'n'.
  // This 'n' will dictate the size of the arrays 'a' and 'c'.
  var   n   =   parseInt ( s [ 0 ] ) ;

  // Initialize array 'a' with a size of 'n'.
  // This array will store parsed data from the input.
  var a = Array ( n ) ; // Array 'a' declaration and initialization.

  // Initialize array 'c' with a size of 'n'.
  // This array will also store parsed data, distinct from 'a'.
  var c = Array ( n ) ; /* Array 'c' declaration and initialization. */

  // Loop to populate array 'a'.
  // It reads 'n' lines starting from the second line of the input (s[1] to s[n]).
  for ( var   i = 0 ;   i < n ; i ++ ) {
    // For each line, split it by spaces, then convert each part to an integer.
    // The result is an array of integers, which is then assigned to a[i].
    a [ i ] = s [ i + 1 ] . split ( " " ) . map ( a => parseInt ( a ) ) ;
  } // End of loop for populating array 'a'.

  // Loop to populate array 'c'.
  // It reads 'n' lines starting from s[n+1] to s[2n].
  for ( var   i = 0 ; i < n ;   i ++ )
  {
    // Similar to array 'a', each line is split by spaces and parsed into integers.
    // The resulting array of integers is assigned to c[i].
    c [ i ] = s [ i + n + 1 ] . split ( " " ) . map ( a => parseInt ( a ) ) ;
  } // End of loop for populating array 'c'.


  // Sort array 'a' primarily by its second element (index 1) in ascending order.
  // This is the first sorting pass for array 'a'.
  a = a . sort ( ( a , b ) => a [ 1 ] - b [ 1 ] ) ;

  // Sort array 'a' secondarily by its first element (index 0) in ascending order.
  // This ensures a stable sort based on the first element after the second element sort.
  a = a . sort ( ( a , b ) => a [ 0 ] - b [ 0 ] ) ;

  // Sort array 'c' primarily by its second element (index 1) in descending order.
  // This is the first sorting pass for array 'c'.
  c = c . sort ( ( a , b ) => b [ 1 ] - a [ 1 ] ) ;

  // Sort array 'c' secondarily by its first element (index 0) in ascending order.
  // This provides a stable sort for 'c' based on the first element.
  c = c . sort ( ( a , b ) => a [ 0 ] - b [ 0 ] ) ;

  // Initialize a counter variable 'ans' to store the final result.
  // This variable will count successful matches.
  var ans = 0 ;

  // Outer loop: Iterate through array 'a' from the end to the beginning.
  // This approach is often used in matching algorithms.
  for ( i = n - 1 ;   i >= 0 ;   i -- )
  {
    // Inner loop: Iterate through array 'c' from the end to the beginning.
    // It attempts to find a match for the current element a[i].
    for ( var   j = c . length - 1 ;   j >= 0 ;   j -- )
    {
      // Check if the current element from 'a' (a[i]) can be matched with
      // the current element from 'c' (c[j]) based on specific conditions.
      // Condition: a[i][0] must be less than c[j][0] AND a[i][1] must be less than c[j][1].
      if ( a [ i ] [ 0 ] < c [ j ] [ 0 ]   &&   a [ i ] [ 1 ] < c [ j ] [ 1 ] )
      {
        ans ++ ; // Increment the answer counter if a match is found.
        c . splice ( j , 1 ) ; // Remove the matched element from array 'c' to prevent re-matching.
        break ; // Exit the inner loop as a match for a[i] has been found.
      }
    } // End of inner loop for array 'c'.
  } // End of outer loop for array 'a'.

  // Output the final count of successful matches to the console.
  console . log ( ans ) ;
} // End of the Main function definition.

// Call the Main function with the input read from standard input.
// - require("fs").readFileSync("/dev/stdin", "utf8") reads the entire file as a string.
// - .trim() removes leading/trailing whitespace, including the final newline.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;