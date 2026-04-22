/*
 * This JavaScript file contains a function named 'Main'
 * which processes an input string, performs some calculations
 * to generate a grid-like pattern, and then prints it to the console.
 *
 * The pattern generation involves several conditional checks
 * and array manipulations based on parsed input values.
 */

// Define the primary function that processes the input string.
function Main ( s ) {

  // Step 1: Parse the input string 's'.
  // It's expected to be a space-separated string of numbers.
  // The 'split' method divides the string into an array of substrings using a space as a delimiter.
  // The 'map' method then iterates over these substrings and converts each one to an integer using 'parseInt'.
  s = s . split ( " " ) . map ( a => parseInt ( a ) ) ;


  // Declare four variables that will be used to store
  // processed input values and characters for the pattern.
  var a , b , c , d ;


  // Step 2: Determine initial values for 'a', 'b', 'c', and 'd'
  // based on a comparison of the first two parsed numbers from the input array 's'.
  if ( s [ 0 ] > s [ 1 ] ) { // Check if the first number (s[0]) is strictly greater than the second number (s[1]).

    // If s[0] is greater, assign s[0] to variable 'a' and s[1] to variable 'b'.
    a = s [ 0 ] ;
    b = s [ 1 ] ;

    // Set character 'c' to a dot ('.') and character 'd' to a hash ('#').
    c = "." ;
    d = "#" ;

  } else { // This block executes if s[0] is not greater than s[1] (i.e., s[0] is less than or equal to s[1]).

    // In this case, assign s[0] to variable 'b' and s[1] to variable 'a', effectively swapping their roles.
    b = s [ 0 ] ;
    a = s [ 1 ] ;

    // Set character 'd' to a dot ('.') and character 'c' to a hash ('#'), also swapping their roles.
    d = "." ;
    c = "#" ;

  } // End of the conditional (if-else) block for initial variable assignments.


  // Step 3: Calculate the dimension 'h' for the square grid.
  // 'h' is derived from 'a' by taking its square root, rounding up to the nearest integer (Math.ceil),
  // and then multiplying the result by 4. This ensures 'h' is a multiple of 4.
  const h = Math . ceil ( Math . sqrt ( a ) ) * 4 ;


  // Step 4: Define base pattern arrays (small character arrays) that will be used
  // to construct larger blocks of the grid. These patterns utilize the characters 'c' and 'd'.
  const a1 = [ c , c , c , d ] ; // Pattern 'a1': three 'c' characters followed by one 'd'.
  const ab = [ c , d , c , d ] ; // Pattern 'ab': alternating 'c' and 'd' characters.
  const a0 = [ d , d , d , d ] ; // Pattern 'a0': four 'd' characters.


  // Initialize the 'ans' array, which will ultimately hold the final grid rows.
  // It starts as an empty array and will be populated with sub-arrays.
  var ans = [ ] ;


  // Initialize two counters, 'aa' and 'bb', both starting at 1.
  // These counters are crucial for the conditional logic within the pattern generation loops.
  var aa = 1 , bb = 1 ;


  // Step 5: Begin the main grid generation loops.
  // This is an outer loop that iterates through rows with a step of 4,
  // processing the grid in 4-row blocks.
  for ( var i = 0 ; i < h ; i += 4 ) {

    // Initialize four consecutive rows in the 'ans' array.
    // Each of these will be an empty array, ready to receive character patterns.
    ans [ i ]     = [ ] ;
    ans [ i + 1 ] = [ ] ;
    ans [ i + 2 ] = [ ] ;
    ans [ i + 3 ] = [ ] ;

    // Inner loop: This loop iterates through columns, also with a step of 4,
    // processing the grid in 4-column blocks.
    for ( var j = 0 ; j < h ; j += 4 ) {

      // Condition 1: Special handling for the very first block of the grid (top-left corner).
      if ( i === 0 && j === 0 ) {

        // For the initial block, push the 'a1' pattern to the first three rows (i, i+1, i+2)
        // and the 'a0' pattern to the fourth row (i+3) of this block.
        ans [ i ] . push ( ... a1 ) ;
        ans [ i + 1 ] . push ( ... a1 ) ;
        ans [ i + 2 ] . push ( ... a1 ) ;
        ans [ i + 3 ] . push ( ... a0 ) ;

      } else if ( aa === a ) { // Condition 2: If the counter 'aa' has reached the value of 'a'.

        // If 'aa' equals 'a', fill all four rows of the current 4x4 block with the 'a0' pattern.
        ans [ i ] . push ( ... a0 ) ;
        ans [ i + 1 ] . push ( ... a0 ) ;
        ans [ i + 2 ] . push ( ... a0 ) ;
        ans [ i + 3 ] . push ( ... a0 ) ;

      } else if ( bb === b ) { // Condition 3: If the counter 'bb' has reached the value of 'b'.

        // If 'bb' equals 'b', fill the first three rows (i, i+1, i+2) with 'a1'
        // and the fourth row (i+3) with 'a0'.
        ans [ i ] . push ( ... a1 ) ;
        ans [ i + 1 ] . push ( ... a1 ) ;
        ans [ i + 2 ] . push ( ... a1 ) ;
        ans [ i + 3 ] . push ( ... a0 ) ;
        aa ++ ; // Increment counter 'aa' after applying this pattern.

      } else { // Condition 4: This is the default case if none of the above conditions are met.

        // For the default scenario, fill rows 'i' and 'i+2' with 'a1',
        // row 'i+1' with 'ab', and row 'i+3' with 'a0'.
        ans [ i ] . push ( ... a1 ) ;
        ans [ i + 1 ] . push ( ... ab ) ;
        ans [ i + 2 ] . push ( ... a1 ) ;
        ans [ i + 3 ] . push ( ... a0 ) ;
        aa ++ ; // Increment counter 'aa'.
        bb ++ ; // Increment counter 'bb'.

      } // End of the inner conditional (if-else if-else) block.

    } // End of the inner 'j' loop.

  } // End of the outer 'i' loop.


  // Step 6: Post-processing the 'ans' array.
  // Iterate through each row of the 'ans' array from 0 to h-1.
  for ( i = 0 ; i < h ; i ++ ) {

    // For each row, join all the characters within that row's array into a single string.
    // The empty string "" as a separator means the characters are concatenated without any delimiters.
    ans [ i ] = ans [ i ] . join ( "" ) ;

  } // End of the row joining loop.


  // Step 7: Output the final result to the console.
  // The 'console.log' function is used to print formatted output.
  // The format string "%d %d\n%s" specifies two decimal integers followed by a newline,
  // and then a string.
  // The values provided are 'h', 'h', and the entire 'ans' array joined by newline characters,
  // effectively printing the grid dimensions and then the grid itself.
  console . log ( "%d %d\n%s" , h , h , ans . join ( "\n" ) ) ;

} // End of the Main function definition.


// --- Program Entry Point ---
// This line of code executes the 'Main' function.
// It reads input from '/dev/stdin' (standard input), decodes it as UTF-8,
// removes any leading or trailing whitespace using 'trim()',
// and then passes the resulting string to the 'Main' function.
// This is a typical setup for reading input in Node.js environments, especially in competitive programming.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;

/*
 * End of file.
 * This script successfully generates a visual pattern based on the provided numerical input.
 */