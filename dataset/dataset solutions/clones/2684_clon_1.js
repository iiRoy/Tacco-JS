/*
 * This is the main function that processes the input.
 * It determines if a sequence of heights is "Yes" or "No" based on a specific rule.
 */

function        Main    (   input   )
{


        // First, the input string is split into an array of lines.
    input   =   input.split (   "\n"    )   ;

    // The first line contains the integer N.
    var     n       =   parseInt    (   input   [   0   ]   ,   10  )   ;

        // The second line contains space-separated heights, stored as strings initially.
    var h       =       input   [   1   ]   .split  (   " " )   ;

    /*
     * Initialize a flag 'b' to 'Yes'.
     * This flag will be changed to 'No' if the condition is not met.
     */
    var     b       =       'Yes'   ;


    // Loop through the heights from right to left (N-1 down to 1).
    for (   var     i       =       n   -   1       ;       i       >       0       ;       i--     )
    {
        // Check the condition: if the previous height minus the current height is greater than 1.
        if  (   h   [   i   -   1   ]   -   h   [   i   ]       >       1   )
        {
            // If the condition is met, set 'b' to 'No' and exit the loop.
            b       =       'No'    ;
            break   ;
        }

        // Else if the previous height minus the current height is exactly 1.
        else    if  (   h   [   i   -   1   ]   -   h   [   i   ]       ==      1   )
        {
            // If this condition is met, decrement the previous height by 1.
            h   [   i   -   1   ]       =       h   [   i   -   1   ]   -   1   ;
        }
    }


    /*
     * Output the final result.
     * This will be either 'Yes' or 'No'.
     */
    console .   log (   b   )   ;


}


/*
 * Do not edit below this line.
 * This part reads input from standard input and calls the Main function.
 */
Main    (   require (   "fs"    )   .readFileSync   (   "/dev/stdin"    ,   "utf8"  )   )   ;