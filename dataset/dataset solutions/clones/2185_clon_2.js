// This function processes numerical input to check for parity
function    DetermineParity (   incomingText    ) {
    /* The supplied text string is first split and then its parts are converted to integers. */
    let [   valueOne    ,   valueTwo    ]   =   incomingText    .   split   (   ' ' )   .   map (   ( fragment  )   =>  {
        return  parseInt(fragment, 10);
    });

    // Check if the product of the two numbers is odd or even
    if  (   (   valueOne    *   valueTwo    )   %   2   === 1   )   {
        console .   log (   'Odd'   )   ;
    }
    else
    {
        console .   log (   'Even'  )   ;
    }
}
// The program execution starts by reading data from standard input.
DetermineParity (   require (   "fs"    )   .   readFileSync    (   "/dev/stdin"    ,   "utf8"  )   )   ;