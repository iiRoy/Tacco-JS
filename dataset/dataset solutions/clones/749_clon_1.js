/*
 * This file processes input data to calculate a specific value.
 * It reads from standard input, parses lines, and performs calculations
 * within a loop until a specific termination condition is met.
 */

// --- Start of main script execution ---

var  input  =  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ;
// The 'fs' module is used for file system operations.
// readFileSync reads the entire file synchronously from the specified path.

var   arr = input . trim ( ) . split ( "\n" ) ;
// The input string is first trimmed of leading/trailing whitespace,
// then split into an array of strings based on newline characters.

while ( true ) {
  // Main processing loop. It continues indefinitely until a 'break' statement is encountered.

  var   abc = arr . shift ( ) ;
  // Retrieves the first element from the array 'arr' and removes that element from the array.

  if ( abc == "0 0 0 0 0" ) {
    // Check for the termination condition: if 'abc' matches the specific string.
    break ; // Exits the 'while' loop if the condition is met.
  }

  // Concatenate 'abc' with a space and the next shifted element from 'arr'.
  // Then, split the resulting string by spaces and map each part to a Number.
  var   ary = ( abc + " " + arr . shift ( ) ) . split ( " " ) . map ( Number ) ;

  /*
   * This is an Immediately-Invoked Function Expression (IIFE).
   * It is designed to encapsulate a block of logic and execute it immediately.
   * The parameters (a, b, c, d, e, na, nb, nc) are populated from the 'ary' array
   * using the 'apply' method, which passes array elements as individual arguments.
   */
  ( function ( a , b , c , d , e , na , nb , nc ) {

    var   ans = 0 ; // Initialize the answer variable to zero.

    // Calculate the remainder when 'nc' is divided by 'd'.
    var   amari = nc % d ;
    // Calculate the quotient (integer division) for 'nc' divided by 'd'.
    var   yaku = ( nc - amari ) / d ;

    // Calculate 'nokori' based on 'd' and 'amari'.
    var   nokori = d - amari ;

    // Add the initial component to 'ans'.
    ans += yaku * d * e ;

    // Conditional logic based on a comparison involving 'amari * c' and 'd * e'.
    if ( amari * c <= d * e ) {
      /*
       * This block is executed if the condition 'amari * c <= d * e' is true.
       * It performs specific calculations and adjustments to 'na' and 'nb'.
       */
      ans += d * e ; // Add 'd * e' to 'ans'.

      while ( nokori -- ) {
        // Loop while 'nokori' is greater than zero, decrementing it after each iteration.
        if ( na > 0 ) {
          na -- ; // Decrement 'na' if it is positive.
        } else if ( nb > 0 ) {
          nb -- ; // If 'na' is not positive, decrement 'nb' if it is positive.
        }
      }
    } else {
      /*
       * This block is executed if the initial 'if' condition (amari * c <= d * e) is false.
       * It involves different calculations for 'ans' and also modifies 'na' and 'nb'.
       */
      ans += amari * e ; // Add 'amari * e' to 'ans'.

      while ( nokori -- ) {
        // Another loop that decrements 'nokori' in each iteration.
        if ( na > 0 ) {
          na -- ;      // Decrement 'na'.
          ans += e ;   // Add 'e' to 'ans'.
        } else if ( nb > 0 ) {
          nb -- ;      // Decrement 'nb'.
          ans += e ;   // Add 'e' to 'ans'.
        }
      }
    }

    // Add the final components to the total answer.
    ans += a * na + b * nb ;

    // Output the calculated answer to the standard console.
    console . log ( ans ) ;

  } ) . apply ( null , ary ) ; // Execute the IIFE, passing elements of 'ary' as arguments.

} // End of the 'while' loop.

/*
 * --- Script execution completed ---
 * The program terminates after the loop condition is met and the 'break' statement is executed.
 */