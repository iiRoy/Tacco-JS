/* This is a Type I clone of an existing JavaScript function.
 * The original logic and structure are preserved exactly.
 * Only whitespace and comments have been altered.
 * This clone aims to be visually distinct from the source.
 */
function Main(  s  ) { // Main function definition begins here, taking 's' as input.


  // The input string 's' is first split into an array of lines.
  s = s . split ( "\n" ) ;


  /* The first line of input (s[0]) is processed.
   * It contains two space-separated numbers which are parsed into an array 'n'.
   * The 'map(a=>+a)' part converts string numbers to actual numbers.
   */
  var n = s [ 0 ] . split ( " " ) . map ( a => + a ) ;


  // 'm' is assigned the second number from the parsed array 'n'.
  var m = n [ 1 ] ;
  // 'n' is then reassigned the first number, effectively separating the two values.
  n = n [ 0 ] ;


  // The second line of input (s[1]) is also split and parsed into an array 'a'.
  var a = s [ 1 ] . split ( " " ) . map ( a => + a ) ;


  // Initialize the variable 'ans' (for answer) to zero.
  var ans = 0 ;


  // Initialize an empty object 'b', which will serve as a frequency map (hash map).
  var b = { } ;


  // Initialize 't' (for temporary sum) to zero.
  var t = 0 ;


  // Start of the first loop: iterate 'n' times.
  // This loop calculates prefix sums modulo 'm' and stores their frequencies.
  for ( var i = 0 ;   i < n ;   i ++ ) {


    // Calculate the running sum modulo 'm'.
    t = ( t + a [ i ] ) % m ;


    // Check if 't' (the current remainder) already exists as a key in 'b'.
    if ( b [ t ] ) {
      // If it exists, increment its frequency count.
      b [ t ] ++ ;
    }
    else {
      // If it doesn't exist, initialize its frequency count to 1.
      b [ t ] = 1 ;
    }
  } // End of the first 'for' loop.


  /* Start of the second loop: iterate through the keys (remainders) in object 'b'.
   * This loop calculates pairs based on the frequencies of each remainder.
   */
  for ( i   in   b ) {


    // Convert the key 'i' (which is a string by default when iterating 'in' an object) to a number.
    i = + i ;


    // Special case: If the remainder 'i' is 0.
    // For remainder 0, we count pairs of elements that sum to 0 mod m,
    // plus elements that are 0 mod m themselves.
    // The formula b[i] * (b[i] + 1) / 2 correctly counts all such pairs and individual elements.
    if ( i === 0 ) {
      ans += b [ i ] * ( b [ i ] + 1 ) / 2 ;
    }
    // General case: If the remainder 'i' is not 0, and its frequency is greater than 1.
    // We count pairs of elements that have the same non-zero remainder.
    // The formula b[i] * (b[i] - 1) / 2 calculates combinations of 2 from b[i] items.
    else if ( b [ i ] > 1 ) {
      ans += b [ i ] * ( b [ i ] - 1 ) / 2 ;
    }
    // If b[i] is 1 and i is not 0, no pairs can be formed, so no action is needed.
  } // End of the second 'for...in' loop.


  // Output the final calculated answer to the console.
  console . log ( ans ) ;

} // End of the Main function definition.


// This line calls the Main function with input read from standard input.
// It uses Node.js 'fs' module to read the file at "/dev/stdin" as UTF-8.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;