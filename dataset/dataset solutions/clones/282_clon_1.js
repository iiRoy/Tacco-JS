/*
 * This JavaScript program processes input data from standard input.
 * It reads lines, parses numbers, and performs a specific calculation
 * based on the provided logic.
 */

// Import the 'fs' module for file system operations, specifically reading from stdin.
var    input     =    require('fs')   .   readFileSync('/dev/stdin'    ,    'utf8');


// Trim leading/trailing whitespace from the input and split it into an array of lines.
var Arr = (   input.trim()   ).split(   "\n"   );


// Loop through each line in the 'Arr' array.
for
(
    var i = 0;
    i < Arr.length;
    i++
)
{
    // Check for the termination condition: "0 0".
    if
    (
        Arr[i]
        ==
        "0 0"
    )
    {
        // If the condition is met, exit the loop.
        break;
    }


    // Split the current line by space and convert the parts to numbers.
    var arr = Arr[i] . split(   " "   ) . map(Number);

    // Extract the first number as N.
    var N = arr[0];

    // Extract the second number as m.
    var m = arr[1];

    // Initialize an empty object 'n' which will be used as a hash map or array.
    var n = {};


    // Populate the object 'n' with N keys, each initialized to null.
    for
    (
        var j = 0;
        j < N;
        j++
    )
    {
        n[j] = null;
    }


    // Initialize variable 'x' to 0. This variable will be updated in the inner loop.
    var x = 0;


    /*
     * This is the main calculation loop.
     * It iterates N times to process each element.
     */
    for
    (
        var k = 0;
        k < N;
        k++
    )
    {
        // Initialize 'y' to 0 for each iteration of the outer loop.
        var y = 0;

        // Start a do-while loop that continues until 'y' equals 'm'.
        do
        {
            // Increment 'x'.
            x++;

            // If 'x' reaches 'N', reset it to 0, effectively wrapping around.
            if
            (
                x
                ==
                N
            )
            {
                x = 0;
            }

            // If the element at index 'x' in 'n' is null, increment 'y'.
            if
            (
                n[x]
                ===
                null
            )
            {
                y++;
            }
        }
        while
        (
            y
            !=
            m
        ); // Loop continues as long as 'y' is not equal to 'm'.

        // Assign the current value of 'k' to the element 'n[x]'.
        n[x] = k;
    }

    // Print the final value of 'x' for the current input line.
    console.log(   x   );
}