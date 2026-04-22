/*
 * This JavaScript file processes mathematical equations where 'X' acts as a placeholder
 * for a single digit (0-9). It attempts to find the digit that satisfies the equation.
 *
 * This is a Type I clone, meaning it is an exact copy of the original code
 * in terms of functionality and structure, with only variations in
 * whitespace and comments.
 */


function main ( ) {

  // Iterate over each line of input received.
  input . forEach ( function ( v ) {

    /*
     * First, split the input string by the equals sign to separate
     * the left and right sides of the equation.
     */
    var num = v . split ( "=" ) ;

    // The left side is further split by the plus sign, representing two operands.
    var left = num [ 0 ] . split ( "+" ) ;

    // The right side is the expected result.
    var right = num [ 1 ] ;

    // Initialize 'ans' to -1, indicating no solution found yet.
    var ans = -1 ;


    // Loop through all possible digits (0-9) to replace 'X'.
    for ( let i = 0 ; i < 10 ; i ++ ) {

      // Special check: If 'i' is 0 and 'X' is the leading digit of any number,
      // then this is an invalid substitution.
      if ( i === 0
        && ( left [ 0 ] [ 0 ] === "X"
          || left [ 1 ] [ 0 ] === "X"
          || num [ 1 ] [ 0 ] === "X" )
      ) {
        // Skip this iteration and try the next digit.
        continue ;
      }

      // Replace 'X' in the first operand with the current digit 'i' and parse it as an integer.
      var a = parseInt ( left [ 0 ] . replace ( /X/g , i ) ) ;

      // Replace 'X' in the second operand with 'i' and parse it.
      var b = parseInt ( left [ 1 ] . replace ( /X/g , i ) ) ;

      // Replace 'X' in the right-hand side (result) with 'i' and parse it.
      var x = parseInt ( num [ 1 ] . replace ( /X/g , i ) ) ;


      // Check if the sum of the two operands equals the expected result.
      if ( a + b === x ) {

        // If it matches, we found the correct digit.
        ans = i ;

        // No need to check further digits, so break out of the loop.
        break ;
      }
    }

    // Output the result: "NA" if no digit was found, otherwise the digit itself.
    console . log ( ( ans < 0 ) ? "NA" : ans ) ;
  } ) ;
}


// Declare a global variable to accumulate all incoming standard input.
var input = '' ;

// Resume the standard input stream to start listening for data.
process . stdin . resume ( ) ;

// Set the encoding for the standard input stream to UTF-8.
process . stdin . setEncoding ( 'utf8' ) ;

// Attach an event listener for 'data' events on the standard input.
// This function will be called whenever a chunk of data is received.
process . stdin . on ( 'data' , function ( chunk ) {

  // Append the received data chunk to the 'input' variable.
  input += chunk ;
} ) ;

// Attach an event listener for the 'end' event on the standard input.
// This function will be called when there is no more input to read.
process . stdin . on ( 'end' , function ( ) {

  // Process the accumulated input:
  // 1. Trim any leading/trailing whitespace.
  // 2. Split the string into an array of lines based on newline characters.
  input = input . trim ( ) . split ( '\n' ) ;

  // Call the main function to start the problem-solving logic.
  main ( ) ;
} ) ;