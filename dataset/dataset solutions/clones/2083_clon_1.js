// This is a Type I clone generated from the original JavaScript source.
// The purpose of this transformation is solely to alter whitespace and comments,
// while preserving the exact semantic and structural integrity of the code.

/*
 * This JavaScript file enforces strict mode execution.
 * It helps in writing cleaner and safer code by opting into a restricted variant of JavaScript.
 */
'use strict'

    // Declaration of the primary function named 'main'.
    // This function accepts a single argument, typically representing raw input data.
    const   main    =   (   arg )   =>  {

        // Process the input argument 'arg'.
        // It's assumed to be a string where lines are separated by newline characters.
        // We extract the very first line from this input string.
        const   S   =   arg .   split   (   '\n'    )   [   0   ]

        /*
         * Conditional check:
         * We are evaluating if the extracted string 'S' contains the substring 'hi'.
         * The 'includes' method performs a case-sensitive search.
         */
        if  (   S   .   includes    (   'hi'    )   )
        {
            // If the condition is met (i.e., 'hi' is found in 'S'),
            // then we output the string 'Yes' to the standard console.
            console .   log (   'Yes'   )
        }
        else
        {
            // If the condition is not met (i.e., 'hi' is NOT found in 'S'),
            // then we output the string 'No' to the standard console.
            console .   log (   'No'    )
        }

    }


// This section handles the execution of the 'main' function.
// It reads the entire content of the standard input file ('/dev/stdin')
// as a UTF-8 encoded string and passes it to the 'main' function.
main    (   require (   'fs'    )   .   readFileSync    (   '/dev/stdin'    ,   'utf8'  )   )

// End of the JavaScript program.
// No further code is executed after this point.