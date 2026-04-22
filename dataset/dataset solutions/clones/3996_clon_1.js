/*
 * This file contains the main logic for processing input and calculating a specific count.
 * It's a JavaScript program designed to run in a Node.js environment.
 */
function Main(  input   )
{
    // Initialize the input string by splitting it and converting parts to numbers.
    // This assumes the input is a space-separated string of two numbers.
    input  =  input . split (  ' '  ) . map (  num  =>  Number (  num  )  ) ;


    // Assign the first number from the parsed input to variable 'n'.
    n   =   input [  0  ] ;

    // Assign the second number from the parsed input to variable 'k'.
    k   =   input [  1  ] ;


    // Initialize a counter variable to zero. This will store our final result.
    count = 0 ;

    /*
     * Outer loop: iterates from 1 up to 'n' (inclusive).
     * The variable 'i' represents the current number being processed in the outer loop.
     */
    for
    (
        var
        i
        =
        1
        ;
        i
        <=
        n
        ;
        i
        ++
    )
    {
        // Inner loop: iterates from 1 up to 'n' (inclusive) for each 'i'.
        // The variable 'j' represents the current divisor being tested.
        for
        (
            var
            j
            =
            1
            ;
            j
            <=
            n
            ;
            j
            ++
        )
        {
            // Check the condition: if the remainder of 'i' divided by 'j' is greater than or equal to 'k'.
            // If the condition is met, increment our counter.
            if
            (
                (
                    i
                    %
                    j
                )
                >=
                k
            )
            {
                count
                ++
                ;
            }
        }
    }

    // After all calculations, print the final count to the console.
    console . log (  count  ) ;
}

// Invoke the Main function.
// It reads the entire content of '/dev/stdin' as a UTF-8 string.
Main
(
    require
    (
        'fs'
    )
    .
    readFileSync
    (
        '/dev/stdin'
        ,
        'utf-8'
    )
)
; // End of program execution.