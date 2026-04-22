/* This is an example of a JavaScript program.
 * It reads input, processes it, and prints a result. */
function Main ( inputs ) {

  // Read input lines and split them.
  const   inputlines = inputs . split ( "\n" ) ;

    /* The first line contains limit values.
     * We parse the first element as an integer. */
  const limit = inputlines [ 0 ] . split ( " " ) . map ( x => parseInt ( x , 10 ) ) ;

      // The second line contains input values.
      // These are also parsed as integers.
  const inputvalues = inputlines [ 1 ] . split ( " " ) . map ( x => parseInt ( x , 10 ) ) ;


  /* Define an inline function to calculate the sum of an array of numbers.
   * This is a utility function used later. */
  var sum = function ( arr ) {

        // Initialize sum to zero.
    var sum = 0 ;

          // Iterate over each element in the array.
    arr . forEach ( function ( elm ) {

                // Add the current element to the sum.
        sum += elm ;

      } ) ; // End of forEach loop.

    return sum ; // Return the final sum.

  } ; // End of sum function definition.


    // Calculate the total remaining from the limit after subtracting the sum of input values.
  let total = limit [ 0 ] - sum ( inputvalues ) ;


      // Print the result. If total is non-negative, print total; otherwise, print -1.
  console . log ( total >= 0 ? total : -1 ) ;

} // End of Main function.


// Call the Main function with input read from standard input.
/* This line reads the entire content of /dev/stdin as a UTF-8 string
 * and passes it to the Main function for processing. */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;