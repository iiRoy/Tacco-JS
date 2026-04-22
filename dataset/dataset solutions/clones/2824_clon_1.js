/*
 *  This JavaScript code defines a function 'main'
 *  that processes input for a specific problem.
 *  It calculates cumulative sums and checks a condition.
 */

function   main(    input    )
{
    // Split the input string by newline characters to get individual arguments.
    const   args   =   input . split (   '\n'   )   ;


    /*
     *  The first line of input (args[0]) contains two space-separated integers.
     *  These are parsed and stored in `items1`.
     */
    const   items1   =   args[   0   ] . split (   ' '   ) . map (   i   =>   parseInt (   i   )   )   ;


    // N is derived from the first item, incremented by 1.
    const   N   =   items1[   0   ]   +   1   ;

    // X is the second item from the first line.
    const   X   =   items1[   1   ]   ;


    /*
     *  The second line of input (args[1]) contains a list of
     *  space-separated integers. These are parsed into `List`.
     */
    const   List   =   args[   1   ] . split (   ' '   ) . map (   i   =>   parseInt (   i   )   )   ;


    // Loop from 1 up to N (inclusive)
    for   (   var   i   =   1   ;   i   <=   N   ;   i   ++   )
    {
        // Calculate the sum of elements in 'List' from index 0 up to 'i-1'.
        // This effectively sums the first 'i' elements.
        var   total   =   List . slice (   0   ,   i   ) . reduce (   (   x   ,   y   )   =>   x   +   y   )   ;

        // Check if the calculated total sum is greater than or equal to X.
        if   (   total   >=   X   )
        {
            // If the condition is met, print the current value of 'i'
            // and then exit the function immediately.
            console . log (   i   )   ;
            return   ;
        }
    }

    // If the loop completes without finding a sum >= X,
    // print N - 1 as the final result.
    console . log (   N   -   1   )   ;
}

// Read input from standard input and pass it to the main function.
main (   require (   'fs'   ) . readFileSync (   '/dev/stdin'   ,   'utf8'   )   )   ;

/* EOF */