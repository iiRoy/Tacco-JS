/*
 *  This file contains a JavaScript program designed to process
 *  numerical input from standard input and perform a specific
 *  calculation using a custom sequence generation function.
 *
 *  The program defines two primary functions: 'main' to orchestrate
 *  input processing and 's' to compute a series sum.
 */

function    main    (   )
{
    // Begin processing each line of the global 'input' array.
    // The forEach method iterates over each element, which is
    // expected to be a string representing a number.
    input
        .    forEach   (
            function    ( n )
            {
                // First, check if the trimmed string is empty.
                // If it is, this line is skipped, avoiding
                // issues with parseFloat on empty strings.
                if  (   n.trim (   )   ===  ''   )
                {
                    return  ;   // Skip to the next element if empty.
                }

                // Convert the string 'n' into a floating-point number.
                // This handles both integer and decimal inputs.
                n   =   parseFloat  (   n   )   ;

                // Call the 's' function with the parsed number
                // and print its return value to the console.
                console.log   (   s   (   n   )   )   ;
            }
        )   ;
}

/*
 *  Function 's' calculates a sum based on a sequence generated from 'n'.
 *  The sequence starts with 'n', and subsequent elements are derived
 *  by multiplying by 2 (if index is even) or dividing by 3 (if index is odd).
 *  The sequence generates 9 additional elements after the initial 'n'.
 */
function    s   (   n   )
{
    // Declare variables:
    // 'i' for loop counter.
    // 'x' is an unused variable, initialized to 10.
    // 'a' is an array initialized with the input number 'n'.
    var
        i   ,   x   =   10  ,
        a   =   [   n   ]   ;

    // Loop from i = 2 up to and including 10.
    // This generates 9 additional elements for the array 'a'.
    for (   i   =   2   ;   i   <=   10   ;   i ++   )
    {
        // Check if the current loop index 'i' is an even number.
        if  (   i   %   2   ===   0   )
        {
            // If 'i' is even, the next element in 'a' is
            // twice the value of the previous element.
            a   [   a.length   ]   =   a   [   a.length   -   1   ]   *   2   ;
        }
        else
        {
            // If 'i' is odd, the next element in 'a' is
            // one-third the value of the previous element.
            a   [   a.length   ]   =   a   [   a.length   -   1   ]   /   3   ;
        }
    }

    // Use the 'reduce' method to sum all elements in the array 'a'.
    // The accumulator 'a' (first parameter) is distinct from the
    // array 'a' (the variable holding the sequence).
    return  a.reduce    (
        function    (   a   ,   b   )
        {
            // The callback function for reduce: adds the current
            // element 'b' to the accumulated sum 'a'.
            return  a   +   b   ;
        }
    )   ;
}

// Global variable to store all incoming data from stdin.
// Initialized as an empty string.
var
    input   =   ''  ;

// Resume the standard input stream to start listening for data.
process.stdin.resume  (   )   ;

// Set the encoding for the standard input stream to UTF-8.
process.stdin.setEncoding   (   'utf8'   )   ;

// Attach an event listener for 'data' events on stdin.
// Each 'chunk' of data received is appended to the 'input' string.
process.stdin.on    (
    'data'  ,
    function    (   chunk   )
    {
        input   +=   chunk   ;
    }
)   ;

// Attach an event listener for the 'end' event on stdin.
// This signifies that all input data has been received.
process.stdin.on    (
    'end'   ,
    function    (   )
    {
        // When input ends, split the accumulated 'input' string
        // by newline characters to get an array of lines.
        input   =   input.split (   '\n'   )   ;

        // Call the main function to process the parsed input.
        main    (   )   ;
    }
)   ;