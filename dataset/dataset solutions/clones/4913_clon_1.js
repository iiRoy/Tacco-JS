/*
 * This JavaScript file contains the implementation of the Main function,
 * designed to process a specific type of input data.
 * It calculates a final sum based on a series of transformations.
 */

// Define the primary function that processes the input string.
function   Main   (   input   )
{
    // --- Input Processing Section ---

    // First, remove any leading/trailing whitespace from the input string.
    // Then, split the input string into an array of lines, using the newline character as a delimiter.
    input    =    input.trim()  .  split  (  "\n"  )  ;


    // Parse the first line of the input to determine the number of iterations (N).
    // The base 10 radix is explicitly provided for safety.
    var   N   =   parseInt  (  input[0]  ,   10  ) ;


    // --- Initialization of Core Variables ---

    // Initialize variable 'A' to 1. This represents one of the two quantities being tracked.
    var   A   =   1   ;

    // Initialize variable 'T' to 1. This represents the other quantity being tracked.
    var   T   =   1   ;


    // --- Main Loop for Iterative Calculation ---

    // Loop through the input lines, starting from the second line (index 1)
    // up to and including the N-th line, as indicated by the 'N' variable.
    for  (   var   i   =   1   ;   i   <=   N   ;   i ++   )
    {
        // --- Process Current Input Line ---

        // Split the current input line (input[i]) by spaces.
        // Then, map each resulting string segment to an integer, again using base 10.
        // This 'inp' array will contain two integers for the current iteration.
        var   inp   =   input[i] . split(" ") . map ( ( n )   =>   parseInt( n , 10 ) ) ;

        // Extract the first integer from the processed line; this is 'Ti'.
        var   Ti   =   inp[0] ;

        // Extract the second integer from the processed line; this is 'Ai'.
        var   Ai   =   inp[1] ;


        // --- Calculation of Multiplier 'n' ---

        // Calculate the minimum multiplier 'n' required to ensure both 'T' and 'A'
        // meet or exceed their new targets based on 'Ti' and 'Ai'.
        // Math.ceil is used to round up to the nearest whole number.
        // T / Ti ensures T is a multiple of Ti.
        // A / Ai ensures A is a multiple of Ai.
        var   n   =   Math.max  (   Math.ceil ( T   /   Ti ) ,   Math.ceil ( A   /   Ai )   ) ;


        // --- Update T and A for the Next Iteration ---

        // Update 'T' by multiplying 'Ti' with the calculated multiplier 'n'.
        T   =   Ti   *   n   ;

        // Update 'A' by multiplying 'Ai' with the calculated multiplier 'n'.
        A   =   Ai   *   n   ;
    }


    // --- Final Output ---

    // After the loop completes, log the sum of the final 'A' and 'T' values to the console.
    console.log ( A   +   T ) ;
}


// --- Execution Block ---

// This block ensures the 'Main' function is called when the script runs.
// It reads the entire content of standard input (/dev/stdin) as a UTF-8 string,
// and then passes it to the 'Main' function for processing.
Main  (
    require ( "fs" )
        . readFileSync ( "/dev/stdin" ,   "utf8" )
) ;

// End of script.