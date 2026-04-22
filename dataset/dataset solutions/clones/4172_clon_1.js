/*
 * This is a JavaScript program designed to solve a specific problem.
 * The main function processes an input argument.
 */

function   main  (   arg   )   {

    // Declare and initialize a variable 'a' by processing the input 'arg'.
    // First, split by newline, take the second line, then split by space.
    let     a     =     arg.split (   "\n"   )   [   1   ]   .split (   " "   )    ;


    // Initialize a counter variable 'i' to zero.
    let     i     =     0     ;


    /*
     * This is the core logic loop.
     * It continues as long as all elements in array 'a' are even numbers.
     */
    while     (     a.every (   e     =>     e     %     2     ==     0   )     )     {

        // Increment the counter 'i' for each iteration.
        i     ++     ;

        // Transform array 'a' by dividing each element by 2.
        // This effectively performs a right bit shift on all elements.
        a     =     a.map (   e     =>     e     /     2   )     ;

    }   // End of the while loop


    // After the loop terminates, print the final value of 'i' to the console.
    console.log     (     i     )     ;

}   // End of the main function


// Execute the main function with input read from standard input.
// The input is read as a UTF-8 string.
main   (   require (   'fs'   )   .readFileSync (   '/dev/stdin'   ,   'utf8'   )   )   ;