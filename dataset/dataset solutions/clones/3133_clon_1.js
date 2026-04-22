/*
 * This is a Type I clone of an original JavaScript program.
 * It processes input data to calculate a specific sum.
 * All variable names, function names, and expressions are preserved exactly.
 * Only whitespace and comments have been altered significantly.
 */


function   main   (   input   )
{

    // Declare variables used throughout the function.
    // 'i' and 'j' are loop counters, 'A' stores processed data,
    // and 'ans' accumulates the final result.
    var   i   ,   j   ,   A   ,   ans   =   0


    // Process the first line of input to get initial arguments.
    // It splits by newline, takes the first line, then splits by space.
    var   arg   =   input   .   split   (   "\n"   )   [   0   ]   .   split   (   " "   )


    // Initialize array A with a size based on the second argument.
    A   =   new   Array   (   arg   [   1   ]   )


    // Loop to populate array A from subsequent lines of input.
    // Each line (after the first) is split into an array of strings.
    for   (   i   =   0   ;   i   <   arg   [   0   ]   ;   i   ++   )
    {
        A   [   i   ]   =   input   .   split   (   "\n"   )   [   i   +   1   ]   .   split   (   " "   )
    }


    // Sort array A based on the first element of each inner array.
    // The sorting function compares 'a[0]' and 'b[0]' numerically.
    A   .   sort   (   function   (   a   ,   b   )   {   return   (   a   [   0   ]   -   b   [   0   ]   )   }   )


    // Initialize loop counters 'i' and 'j' for the main processing loop.
    i   =   0
    j   =   0


    // Main processing loop: iterates until 'j' reaches 'arg[1]'.
    while   (   j   <   arg   [   1   ]   )
    {
        // Add the numeric value of the first element of A[i] to 'ans'.
        ans   +=   Number   (   A   [   i   ]   [   0   ]   )

        // Decrement the second element of A[i].
        A   [   i   ]   [   1   ]   --

        // Increment counter 'j'.
        j   ++

        // If the second element of A[i] becomes zero or less,
        // increment 'i' to move to the next item in array A.
        if   (   A   [   i   ]   [   1   ]   <=   0   )
        {
            i   ++
        }
    }


    // Output the final calculated answer to the console.
    console   .   log   (   ans   )

}


// Call the main function with input read from standard input.
// This uses Node.js 'fs' module to synchronously read the file.
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;