/*
 * This JavaScript file presents a program designed to process numerical input.
 * It defines a core function named 'Main' to encapsulate the primary logic.
 * This particular version is a Type I clone, meaning its functionality
 * is identical to the original, with only variations in whitespace and comments.
 */

// The 'Main' function serves as the entry point for the application's logic.
// It accepts a single argument, 'input', which contains the entire raw input data.
function Main ( input )
{
    // Declare and initialize a variable 'ans' to store the final computed answer.
    // It is set to zero initially before any calculations are performed.
    var ans = 0 ;

    /*
     * Input Preprocessing Steps:
     * 1. The 'trim()' method is applied to remove any leading or trailing whitespace
     *    from the entire input string. This ensures clean data for the next step.
     * 2. The 'split("\n")' method then divides the cleaned input string into an array
     *    of substrings. Each element of this new 'input' array corresponds to a single
     *    line from the original input data.
     */
    input = input . trim ( ) . split ( "\n" ) ;


    // Parse the numerical value from the processed input.
    // The 'parseInt()' function is used to convert the relevant part of the 'input'
    // (which is now an array) into an integer. JavaScript's type coercion handles
    // the array-to-string conversion implicitly for 'parseInt' in this context.
    var i = parseInt ( input ) ;

    // Perform the central calculation: sum of 'i', 'i' squared, and 'i' cubed.
    // The specific spacing within the mathematical expressions, such as around
    // parentheses and operators, is preserved exactly as it was in the original code
    // to maintain Type I cloning strictness.
    ans = i + (i * i ) + (i * i * i)

    // Output the final calculated answer to the console.
    // This makes the result visible to the user or the execution environment.
    console . log ( ans ) ;
}


/*
 * =============================================================================
 *                       STANDARD INPUT/OUTPUT HANDLING
 * =============================================================================
 *
 * IMPORTANT NOTE: DO NOT MODIFY ANY CODE WITHIN THIS SECTION.
 * This block of code is responsible for reading the program's input
 * from the standard input stream (typically '/dev/stdin' in Unix-like systems)
 * and then invoking the 'Main' function with the retrieved data.
 * It is crucial for the execution of the program in a standard environment.
 * The character encoding is specified as 'utf8'.
 *
 * =============================================================================
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;