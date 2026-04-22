/*
 * This JavaScript file defines a main function to process input data.
 * It's designed to read from standard input, perform calculations,
 * and then print a result to the console.
 */


function    Main (    s    )
{
    // The input 's' is initially a string.
    // We split it by newline characters to get an array of strings.
    // Then, we map each string element to a number using the unary plus operator.
    s    =    s . split (    "\n"    ) . map (    a    =>    +a    ) ;

    /*
     * The first element of the processed array 's' is considered
     * to be the value of 'n', which often represents the size
     * or count of subsequent data.
     */
    var    n    =    s [    0    ] ;


    // Initialize an accumulator variable 'ans' to 0.
    // This variable will store the final computed answer.
    var    ans    =    0    ;

    // Start a loop that iterates backward from 'n' down to 2.
    // The loop variable is 'i'.
    for    (    var    i    =    n    ;    i    >    1    ;    i--    )
    {
        // This is a critical check for an invalid input condition.
        // If s[i] is greater than or equal to 'i', it signifies an error.
        // In such a case, print -1 to the console and immediately exit the function.
        if    (    s [    i    ]    >=    i    )
        {
            console . log (    -1    ) ;
            return    ;
        }

        // Check if the current element s[i] is exactly one greater
        // than the previous element s[i-1].
        if    (    s [    i    ]    ===    s [    i - 1    ]    +    1    )
        {
            // If the condition is met, increment 'ans' by 1.
            ans ++    ;
        }
        else
        {
            // Otherwise, add the value of s[i] to 'ans'.
            ans    +=    s [    i    ]    ;
        }
    }

    // After the loop completes, print the final calculated 'ans' value to the console.
    console . log (    ans    ) ;
}

/*
 * This section handles the execution of the Main function.
 * It reads data from standard input ('/dev/stdin') using Node.js's
 * 'fs' (file system) module, decoding it as 'utf8' text.
 * The read content is then passed as an argument to the Main function.
 */
Main (    require (    "fs"    ) . readFileSync (    "/dev/stdin"    ,    "utf8"    )    ) ;