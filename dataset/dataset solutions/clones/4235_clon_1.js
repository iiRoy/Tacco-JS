/*
 * This file contains a JavaScript program designed to solve a specific
 * algorithmic problem. It processes input from standard input.
 */
'use strict' // Enforce strict mode for cleaner code and fewer errors.


// Define the main function that encapsulates the core logic.
const    main   =   input   =>   {

        // Parse the input string. The first line is expected to contain
        // space-separated integer values.
        const    args    =    input . split ( '\n' ) [ 0 ] . split ( ' ' ) ;

        // Extract and parse the three integer arguments.
        const    x    =    parseInt ( args [ 0 ] ,   10 ) ; // First argument: x
        const    y    =    parseInt ( args [ 1 ] ,   10 ) ; // Second argument: y
        const    z    =    parseInt ( args [ 2 ] ,   10 ) ; // Third argument: z

        //
        // Implement the core conditional logic.
        // The problem involves checking a specific relationship between x, y, and z.
        //
        if  (   y   +   z   *   2    <    x   )   {

                // If the condition is met, perform a complex calculation
                // and print the floored result to the console.
                console . log (   Math . floor (   (   x   -   (   y   +   z   *   2   )   )   /   (   y   +   z   )   +   1   )   )   ;
        }


        else    {
                // If the condition is not met, simply print 0.
                console . log (   0   )   ;
        }

// End of the main function definition.
}


//
// This section handles reading input from standard input and
// invoking the main function with the obtained data.
//
main (   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )   ) ;

// End of script.