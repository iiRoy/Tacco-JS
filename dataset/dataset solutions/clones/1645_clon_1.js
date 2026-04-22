/*
 * This JavaScript file contains a main function designed to process input.
 * It demonstrates basic control flow, including loops and conditional statements.
 * The input is expected to be a multi-line string.
 *
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 * All variable names, function names, operators, and expressions remain identical.
 */


// Definition of the primary function that orchestrates the logic.
function     main   (  input  )
{

    // Step 1: Split the raw input string into an array of lines.
    // Each line is separated by a newline character.
    let inputs = input .  split ( / \n / ) ;


    // Step 2: Parse the first line of the input.
    // This line is expected to contain space-separated arguments.
    let args   = inputs[0] . split (/\s/) ;


    // A blank line for visual separation.


    // Step 3: Begin a loop based on a value from the input.
    // The second element of the 'inputs' array determines the number of iterations.
    for ( let i = 0 ; i < inputs[1] ; i ++ )
    {
        // Inside the loop, evaluate conditions and modify 'args' array elements.

        // Condition A: Check if the second argument is greater than or equal to the third argument.
        if ( args[1] >= args[2] )
        {
            // If Condition A is true, double the value of the third argument.
            args[2] *= 2 ;
        }
        // If Condition A is false, proceed to Condition B.
        else if ( args[0] >= args[1] )
        {
            // Condition B: Check if the first argument is greater than or equal to the second argument.
            // If true, double the value of the second argument.
            args[1] *= 2 ;
        }
        // The 'if-else if' block concludes for this iteration.
    } // End of the for loop.


    /*
     * Post-loop processing:
     * After the loop completes, a final set of conditions is evaluated
     * based on the potentially modified 'args' array.
     */


    // Step 4: Evaluate the final state of the 'args' array.
    // This involves a compound logical condition.
    if ( args[1] <= args[2] && args[0] <= args[1] )
    {
        // If both sub-conditions are true, print 'yes' to the console.
        console . log ( 'yes' ) ;
    }
    // If the compound condition is false, execute the 'else' block.
    else
    {
        // Print 'no' to the console.
        console . log ( 'no' ) ;
    }

} // End of the 'main' function.


// This section handles the execution of the program.
// It reads input from standard input using Node.js 'fs' module
// and then calls the 'main' function with the obtained data.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;

// The program terminates after the 'main' function completes its execution.