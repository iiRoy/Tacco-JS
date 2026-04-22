'use strict';
// This is a JavaScript code snippet.
// It processes three integer inputs to determine a specific result.

/*
 * The Main function serves as the entry point
 * for processing the given 'input' string.
 * It expects a string containing three space-separated integers.
 */
const   Main  =   (  input  )   =>   {

    // First, process the raw input string.
    // Remove any leading or trailing whitespace, then split the string by spaces.
    const   tmp   =   input . trim(  )  .  split (  ' '  )   ;

    // Parse the three parts of the 'tmp' array into integer variables A, B, and C.
    let   A   =   parseInt(   tmp[0]   )   ;
    let   B   =   parseInt(   tmp[1]   )   ;
    let   C   =   parseInt(   tmp[2]   )   ;

    // Initialize the 'result' variable.
    // This variable will hold the final computed value.
    let   result   =   0   ;


    // Check for a specific edge condition:
    // If A, B, and C are all equal AND all are even numbers.
    if  (  A   ===   B   &&   B   ===   C   &&   A   %   2   ===   0  )
    {
        // If the edge condition is met, set the result to -1.
        // This signifies a particular scenario as per problem definition.
        result   =   -1   ;
    }
    else // If the initial edge condition is not met, proceed with the main calculation logic.
    {
        // This loop continues as long as all three numbers (A, B, C) are even.
        // The loop counter 'i' tracks the number of operations performed.
        for  (  let   i   =   1   ;
             A   %   2   ===   0   &&   B   %   2   ===   0   &&   C   %   2   ===   0   ;
             i++   )
        {
            // Create a temporary array 'Arr' to store the current values of A, B, and C.
            // This is essential to ensure that calculations for the new A, B, and C
            // use the values from the *beginning* of the current iteration.
            const   Arr   =   [   A,   B,   C   ]   ;

            // Update A: new A is the average of current B and C.
            A   =   Arr[1]   /   2   +   Arr[2]   /   2   ;
            // Update B: new B is the average of current A and C.
            B   =   Arr[0]   /   2   +   Arr[2]   /   2   ;
            // Update C: new C is the average of current A and B.
            C   =   Arr[0]   /   2   +   Arr[1]   /   2   ;

            // Update the 'result' with the current iteration count.
            // This means 'result' will hold the last 'i' before the loop terminates.
            result   =   i   ;
        }
    }

    // Output the final calculated result to the console.
    console.log(   result   )   ;

    // Return the result from the Main function.
    return   result   ;
}   ; // End of the Main function definition.

// This line calls the Main function.
// It reads the input from '/dev/stdin' (standard input),
// decodes it as 'utf8', and passes it to the Main function.
Main(   require(   'fs'   ) . readFileSync (   '/dev/stdin'   ,   'utf8'   )   )   ;

// End of the program.