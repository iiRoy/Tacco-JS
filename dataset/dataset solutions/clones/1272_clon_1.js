process . stdin . resume ( ) ; // Initializes the standard input stream for use.


process . stdin . setEncoding ( 'utf8' ) ; // Sets the character encoding for incoming data to UTF-8.


// This is the primary event handler for when data is received from standard input.
process . stdin . on ( 'data' , function ( chunk ) {

  // Convert the input 'chunk' (a Buffer) into a string, then split it by newline characters.
  // This typically results in an array where each element is a line from the input.
  var inputs = chunk . toString ( ) . split ( '\n' ) ;

  // Declare a variable to store the final computed result.
  // The computation happens within an Immediately Invoked Function Expression (IIFE).
  var result = ( function ( input ) { // The 'input' parameter here refers to the parsed number.

    // First, create a range of numbers from 1 up to the 'input' value.
    // Then, filter this range based on specific conditions.
    return new Range ( 1 , input )
      . filter ( function ( v ) { // This anonymous function defines the filtering logic for each number 'v'.

        // The filtering criteria for a number 'v' to be included in the result:
        //   1. 'v' is perfectly divisible by 3 (remainder is 0).
        //   OR
        //   2. The last digit of 'v' is 3 (remainder when divided by 10 is 3).
        //   OR
        //   3. 'v' divided by 10 is exactly 3 (meaning 'v' is 30).
        //   OR
        //   4. The tens digit of 'v' is 3 (e.g., for 30-39, 130-139, etc.).
        return ( ( v % 3 === 0 )
          || ( v % 10 === 3 )
          || ( v / 10 === 3 )
          || ( v / 10 % 10 === 3 ) ) ; // Complex conditional check.

      } ) . join ( ' ' ) ; // After filtering, join all selected numbers into a single string, separated by spaces.

  } ( parseInt ( inputs [ 0 ] , 10 ) ) ) ; // The IIFE is invoked immediately with the first input line, parsed as an integer (base 10).

  // Check if the 'result' variable contains a truthy value (i.e., not an empty string or null).
  if ( result ) {

    // If there is a result, print it to the console. The first argument is an empty string.
    console . log ( '' , result ) ;

  } else {

    // If 'result' is falsy (e.g., an empty string from 'join' on an empty array),
    // print an empty line to the console.
    console . log ( ) ;

  } // End of the conditional output block.


  // This is a local helper function defined within the 'data' event handler's scope.
  // It generates an array of integers from 'beginIndex' to 'endIndex', inclusive.
  function Range ( beginIndex , endIndex ) {

    var result = [ ] ; // Initialize an empty array to hold the sequence of numbers.

    // Loop from the starting index up to and including the ending index.
    for ( var i = beginIndex ; i <= endIndex ; ++ i ) { // Increment 'i' in each iteration.
      result . push ( i ) ; // Add the current number 'i' to the 'result' array.
    }

    return result ; // Return the populated array.

  } // End of the Range function definition.

} ) ; // End of the 'process.stdin.on('data')' event handler.