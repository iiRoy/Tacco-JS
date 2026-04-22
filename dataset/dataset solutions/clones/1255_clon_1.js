/*
 * This script is designed to process numerical input provided via standard input.
 * It calculates the minimum, maximum, and sum of a list of numbers.
 * The first line of input is expected to be the count of numbers, and the second line
 * contains the space-separated numbers themselves.
 */

// Ensure the standard input stream remains open and active.
process . stdin . resume ( ) ;

// Set the character encoding for standard input to 'utf8' for proper text handling.
process . stdin . setEncoding ( 'utf8' ) ;

// Attach an event listener to the 'data' event of the standard input stream.
// This function will be executed whenever data is received.
process . stdin . on ( 'data' , function ( chunk ) {

  // Split the incoming data chunk into an array of strings, using newline characters as delimiters.
  var input = chunk . split ( "\n" ) ;

  // Initialize an empty string variable named 'output'.
  // Although declared, this variable is not actually used in the final output calculation.
  var output = "" ;

  // Store the initial number of elements (lines) in the 'input' array.
  var length = input . length ;

  // Begin a loop to iterate through the 'input' array.
  // This loop's purpose is to clean up any empty lines that might be present.
  for ( var t = 0 ; t < length ; t ++ ) {
    // Check if the current element (line) in the array is an empty string.
    if ( input [ t ] === "" ) {
      // If an empty string is found, remove it from the 'input' array using splice.
      input . splice ( t , 1 ) ;
      // Decrement the 'length' counter because an element has been removed.
      length -- ;
      // Decrement the loop counter 't' to re-evaluate the current index,
      // as the next element has shifted into the current position.
      t -- ;
    } // End of the if condition for checking empty lines.
  } // End of the for loop for cleaning input.


  // Convert the first meaningful line of input (after cleaning) to a number.
  // This number represents the total count of actual data elements to process.
  var num = Number ( input [ 0 ] ) ;

  // Split the second meaningful line of input by spaces to get an array of number strings.
  var nums = input [ 1 ] . split ( " " ) ;

  // Initialize 'min', 'max', and 'sum' variables with the first number from the 'nums' array.
  // It's crucial to convert this string to a Number type immediately.
  var min = Number ( nums [ 0 ] ) ;
  var max = Number ( nums [ 0 ] ) ;
  var sum = Number ( nums [ 0 ] ) ;


  // Start a loop to iterate through the 'nums' array, beginning from the second element (index 1).
  // This loop calculates the true minimum, maximum, and the total sum of all numbers.
  for ( var i = 1 ; i < num ; i ++ ) {
    // Check if the current number (converted to Number type) is less than the current minimum.
    if ( min > Number ( nums [ i ] ) ) {
      // If it is, update the 'min' variable with this new smaller number.
      min = Number ( nums [ i ] ) ;
    } // End of the 'min' comparison block.

    // Check if the current number (converted to Number type) is greater than the current maximum.
    if ( max < Number ( nums [ i ] ) ) {
      // If it is, update the 'max' variable with this new larger number.
      max = Number ( nums [ i ] ) ;
    } // End of the 'max' comparison block.

    // Add the current number (converted to Number type) to the running total in 'sum'.
    sum += Number ( nums [ i ] ) ;
  } // End of the for loop for calculating min, max, and sum.

  // Output the calculated minimum, maximum, and sum to the console.
  // The numbers are concatenated with spaces as separators, following typical problem requirements.
  console . log ( min + " " + max + " " + sum ) ;

} ) ; // End of the 'data' event listener function definition.