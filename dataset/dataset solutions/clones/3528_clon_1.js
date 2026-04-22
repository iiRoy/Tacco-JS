/*
 * This is a JavaScript program designed to solve a specific problem.
 * It takes input from standard input, processes it, and then outputs a result.
 */

function       Main  (  inp  )
{
    // First, process the input string.
    // It's split by newlines, then each line is further split by spaces.
    // Finally, each part is parsed as an integer.
    inp   =   inp . split (   '\n'   ) . map (   x   =>   x . split (   ' '   ) . map (   y   =>   parseInt (   y   ,   10   )   )   )   ;


    // Extract specific values from the processed input arrays.
    // The third and fourth elements from the first line are X and Y.
    let   [   ,   ,   X   ,   Y   ]   =   inp   [   0   ]   ;
    // The second and third lines become arrays x and y, respectively.
    let   x   =   inp   [   1   ]   ,   y   =   inp   [   2   ]   ;

    // Add the extracted X and Y values to their respective arrays.
    x . push (   X   )   ;
    y . push (   Y   )   ;


    // Now, perform the core logic of the problem.
    // Check if the maximum value in array 'x' is less than the minimum value in array 'y'.
    if   (   x . reduce (   (   a   ,   b   )   =>   Math . max (   a   ,   b   )   )   <   y . reduce (   (   a   ,   b   )   =>   Math . min (   a   ,   b   )   )   )
    {
        // If the condition is true, print 'No War'.
        console . log (   'No War'   )   ;
    }
    else
    {
        // Otherwise (if the condition is false), print 'War'.
        console . log (   'War'   )   ;
    }
} // End of the Main function.


// This line reads input from standard input and passes it to the Main function.
Main   (   require   (   'fs'   ) . readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;