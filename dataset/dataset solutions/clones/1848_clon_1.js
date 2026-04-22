/*
 * This JavaScript file processes a single line of input,
 * extracting the last character and printing a specific
 * string based on its value.
 *
 * This is a Type I clone, meaning only whitespace and comments
 * have been altered from the original source.
 */

// Define the main function that takes 'lines' as its argument.
function   main ( lines )
{

  // Convert the input string into an array of characters.
  const   input   =   lines . split ( '' ) ;

  // Retrieve the last character from the input array.
  const   lastNumber   =   input [ input . length   -   1 ] ;

  // Initialize an empty string for potential future use (though not used in this logic).
  let   output   =   '' ;


  // --- Decision Logic Starts Here ---

  // Check if the last number corresponds to the 'hon' category.
  if   (   lastNumber   ==   2   ||   lastNumber   ==   4   ||   lastNumber   ==   5   ||   lastNumber   ==   7   ||   lastNumber   ==   9   )
  {
    // If it's a 'hon' number, print 'hon' to the console.
    console . log ( 'hon' ) ;
    // Exit the function immediately after printing.
    return   ;
  }
  // If not 'hon', check if it's a 'bon' number.
  else   if   (   lastNumber   ==   3   )
  {
    // If it's a 'bon' number, print 'bon' to the console.
    console . log ( 'bon' ) ;
    // Exit the function immediately.
    return   ;
  }
  // If neither 'hon' nor 'bon', check if it's a 'pon' number.
  else   if   (   lastNumber   ==   0   ||   lastNumber   ==   1   ||   lastNumber   ==   6   ||   lastNumber   ==   8   )
  {
    // If it's a 'pon' number, print 'pon' to the console.
    console . log ( 'pon' ) ;
    // Exit the function immediately.
    return   ;
  }
  // --- Decision Logic Ends Here ---

} // End of the main function definition.


/*
 * This section reads input from standard input and
 * passes it to the main function for processing.
 *
 * It uses Node.js's 'fs' module to read the file
 * asynchronously and then immediately executes 'main'.
 */
main (   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )   ) ;