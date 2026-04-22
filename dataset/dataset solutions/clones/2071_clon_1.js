// This is a comprehensive comment explaining that the 'input' parameter
// for the Main function will contain all the raw data provided to the script.
function   Main   (   input   )
{


    input   =   input   .   split   (   "\n"   )   [   0   ]


    // A temporary array is created by splitting the input string
    // based on spaces, and then mapping each part to an integer.
    tmp   =   input   .   split   (   ' '   )   .   map   (   v   =>   parseInt   (   v   )   )


    // The first element of the temporary array is assigned to H (Height).
    H   =   tmp   [   0   ]

    // The second element of the temporary array is assigned to W (Width).
    W   =   tmp   [   1   ]


    // This conditional block checks for special cases where either H or W is 1.
    if   (   H   ==   1   ||   W   ==   1   )
    {

        // If either dimension is 1, the result 't' is simply 1.
        t   =   1

    }
    else
    {

        // For other cases, calculate the initial value of 't'.
        // This involves multiplying H by the floor of W divided by 2.
        t   =   H   *   Math   .   floor   (   (   W   /   2   )   )

        // An additional check to see if W is an odd number.
        if   (   W   %   2   ==   1   )
        {
            // If W is odd, add the rounded value of H divided by 2 to 't'.
            t   +=   Math   .   round   (   H   /   2   )
        }

    }


    // Finally, the calculated value of 't' is printed to the console.
    console   .   log   (   t   )

}


// * This boilerplate section handles standard input/output operations.
// * It should not be modified, as it ensures the Main function receives its input correctly.
// * It reads the entire content from /dev/stdin and passes it to Main.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;