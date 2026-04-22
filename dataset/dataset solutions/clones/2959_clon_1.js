/*
 * This JavaScript code solves a specific problem involving probabilities.
 * It processes input to calculate a final output value.
 *
 * This is a Type I code clone, preserving all original logic, identifiers,
 * and expressions, while extensively modifying whitespace and comments
 * to achieve visual distinction.
 */

function   Main   (   input   )   {

  // First, we process the raw input string.
  // It's trimmed to remove leading/trailing whitespace,
  // and then split into an array of strings based on spaces.
  input   =   input . trim ( ) . split (   " "   ) ;


  // Next, we parse the necessary integer values from the processed input.
  // The first element of the array is parsed as an integer for variable N.
  var   N   =   parseInt (   input [ 0 ] ,   10   ) ;

  // The second element is parsed as an integer for variable K.
  var   K   =   parseInt (   input [ 1 ] ,   10   ) ;


  // Initialize the 'output' variable, which will accumulate our final result.
  var   output   =   0 ;


  /*
   * This is the primary outer loop of the algorithm.
   * It iterates from 1 up to and including the value of N.
   * Each iteration represents a possible initial state or value.
   */
  for   (   var   i   =   1 ;   i   <=   N ;   i ++   )   {

    // Inside the outer loop, 'tmp' is initialized.
    // It represents a temporary probability or fraction for the current 'i'.
    var   tmp   =   1   /   N ;


    /*
     * This is the inner loop. It simulates a process of repeated multiplication
     * or halving of probability until a condition is met.
     * The loop is set to run a large fixed number of times (100,000)
     * to ensure the condition is eventually met for practical purposes.
     */
    for   (   var   j   =   0 ;   j   <   100000 ;   j ++   )   {

      // Check if the current value of K is less than or equal to
      // 'i' multiplied by 2 raised to the power of 'j'.
      // This is a crucial conditional check for the problem's logic.
      if   (   K   <=   i   *   Math . pow (   2 ,   j   )   )   {

        // If the condition is true, we add the current 'tmp' value to our 'output'.
        // This 'tmp' represents the probability associated with reaching the condition.
        output   +=   tmp ;

        // Once the condition is met for the current 'i',
        // we can break out of the inner loop and proceed to the next 'i'.
        break ;
      }

      else
      {
        // If the condition is not met, it means we need to continue the process.
        // The temporary probability 'tmp' is halved for the next iteration.
        tmp   /=   2 ;
      }   // End of the 'else' block.

    }   // End of the inner 'for' loop (variable j).

  }   // End of the outer 'for' loop (variable i).


  // After all calculations are complete, the final accumulated 'output'
  // is printed to the console.
  console . log (   output   ) ;

}   // End of the Main function definition.


/*
 * This section handles the execution environment.
 * It reads input from standard input using Node.js's 'fs' module,
 * and then calls the 'Main' function with this input.
 */
Main   (   require (   "fs"   ) . readFileSync (   "/dev/stdin" ,   "utf8"   )   ) ;

// This comment serves no functional purpose, just adding to the Type I variation.
// All original identifiers (variables, functions, operators) are strictly preserved.
/*
 * Another multi-line comment.
 * The structural integrity and logical flow of the original code are maintained.
 * Only non-semantic changes (whitespace, comments) have been made.
 */