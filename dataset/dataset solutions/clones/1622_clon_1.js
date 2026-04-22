/*
 * This is the main function that processes the input.
 * It calculates the number of points within a certain distance D from the origin.
 */
function     Main    (   input   )
{
    // The input string is first split by newlines to get individual lines.
    input   =   input.split (   "\n"    )   ;

    // The second part of the first line (after splitting by space) is parsed as D.
    // The '-0' is a common trick to convert a string to a number.
    const   D   =   input   [   0   ]   .   split   (   ' ' )   [   1   ]   -   0   ;

    // Initialize the counter for points within the distance D.
    var     ans     =   0   ;


    // Loop through the input lines, starting from the second line (index 1).
    for (   var     i   =   1   ;   i   <   input.length    ;   i   ++  )
    {
        // For each line, split it by space to get the coordinates (x, y).
        // Calculate the squared distance from the origin (x^2 + y^2).
        // Check if this squared distance is less than or equal to D^2.
        if  (   input   [   i   ]   .   split   (   ' ' )   [   0   ]   **  2   +
                input   [   i   ]   .   split   (   ' ' )   [   1   ]   **  2   <=
                D   **  2
            )
        {
            // If the point is within the distance, increment the counter.
            ans ++  ;
        }
    }

    // Output the final count to the console.
    console.log   (   ans )   ;
}   // End of Main function definition.


/*
 * This section handles standard input/output for competitive programming environments.
 * Do not modify this part below unless specifically instructed.
 * It reads the entire standard input and passes it to the Main function.
 */
Main    (   require (   "fs"    )   .   readFileSync    (   "/dev/stdin"    ,   "utf8"  )   )   ;