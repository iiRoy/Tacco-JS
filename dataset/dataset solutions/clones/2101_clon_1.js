/*
 * This is a Type I clone of the original JavaScript code.
 * It processes input to determine a specific numerical relationship.
 * All identifiers, operators, and expressions are kept identical.
 * Only whitespace and comments have been modified extensively.
 */

// Define the main function that processes the input.
function   Main  (  input  )   {

    // Declare a temporary variable to hold processed input parts.
    var   tmp   =   input . trim ( ) . split (   ' '   )  ;

    // Parse the first part of the input as integer A.
    var   A   =   parseInt (   tmp [   0   ]   )  ;
    // Parse the second part of the input as integer B.
    var   B   =   parseInt (   tmp [   1   ]   )  ;


    // Calculate Ax, which is A divided by 0.08, floored.
    var   Ax   =   Math . floor (   A   /   0.08   )  ;

    // Initialize the result variable. Default is -1.
    var   result   =   -1   ;

    // Check if the floored value of Ax multiplied by 0.1 is strictly equal to B.
    if   (   Math . floor (   Ax   *   0.1   )   ===   B   )   {
        // If the condition is met, update the result to Ax.
        result   =   Ax   ;
    }


    // Output the final result to the console.
    console . log (   result   )  ;
    // Return the calculated result.
    return   result   ;
}

// Call the Main function with input read from standard input.
// The fs module is used to read the file, and it's decoded as UTF-8.
Main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,  'utf8'  )  )  ;