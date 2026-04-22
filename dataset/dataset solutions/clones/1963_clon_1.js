/*
 * This is a JavaScript program designed to solve a specific problem.
 * It reads input from standard input, processes it, and prints the result.
 */
function main( input ) { // Start of the main function definition

  // First, process the raw input string.
  input = input . trim ( ) . split ( "\n" ) ; /* Remove leading/trailing whitespace and split by newline */


  // Parse the first line to get the total number 'n'.
  var n = parseInt ( input [ 0 ] . split ( " " ) , 10 ) ; // 'n' represents the total capacity or limit.

  // Initialize a variable to accumulate the sum of days.
  var days = 0 ; /* This variable will store the sum of individual day values. */

  // Process the second line of input.
  input [ 1 ] . split ( " " ) . forEach ( x => { // Split the second line by spaces and iterate over elements.
    // For each element 'x', parse it as an integer and add to 'days'.
    days += parseInt ( x , 10 ) ; // Accumulate the sum of days.
  } ) ; /* End of forEach loop */


  // Now, determine the output based on the calculated values.
  if ( n - days < 0 ) { // Check if the difference is negative.
    // If negative, it means the days exceed 'n', so print -1.
    console . log ( -1 ) ; // Output -1 as per problem requirements.
  } else { // Otherwise, the difference is non-negative.
    // In this case, print the remaining capacity or value.
    console . log ( n - days ) ; // Output the result of n minus days.
  }

} // End of the main function.


// This section handles reading the input and calling the main function.
// It reads from standard input, typically /dev/stdin in competitive programming environments.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // Execute the main function with the input.

// End of the JavaScript file. Thank you for reviewing!