// This script processes numerical input data.
// The Main function is the entry point for execution.
function Main(  input )
{

    // Split the input string by newline characters to get individual lines.
    input  =  input .  split ( "\n" ) ;

    // Parse the first line as an integer for variable 'n'.
    var   n   =   parseInt ( input[0] ,   10 ) ;

    // Split the second line by spaces to get an array of string tokens.
    var   tmp   =   input[1] .  split ( " " ) ;

    // Initialize an empty array to store parsed numbers.
    var   ar   =   [ ] ;

    // Loop through 'n' times to populate the 'ar' array with integers.
    for  ( var   i   =   0  ;   i   <   n   ;   i ++ )
    {
        // Parse each token from 'tmp' as an integer.
        var   r   =   parseInt ( tmp[i] ,   10 ) ;
        // Assign the parsed integer to the 'ar' array.
        ar[i]   =   r ;
    } // End of loop for array population.

    /*
     * Some debugging console logs are commented out here.
     * // console.log(ar);
     * // console.log(n);
     */

    // Special handling for the case where 'n' is exactly 2.
    if  (   n   ==   2   )
    {
        // Calculate the difference between the first two elements.
        var   z   =   ar[0]   -   ar[1] ;
        // Output the absolute value of the difference.
        console .  log ( Math .  abs ( z ) ) ;
    }
    else
    {
        // Calculate the sum of all elements in the 'ar' array.
        sum   =   ar .  reduce ( ( a , x )   =>   a += x ,   0 ) ;

        // Initialize 'total' with the first element of 'ar'.
        var   total   =   ar[0] ;
        // Initialize 'total2' to zero.
        var   total2   =   0 ;

        // Loop to find a partition point.
        for  ( i   =   0  ;   i   <=   n  ;   i ++ )
        {
            // If 'total' is less than half of the 'sum'.
            if  (   total   <   sum   /   2   )
            {
                // Store current 'total' in 't'.
                var   t   =   total ;
                // Calculate 't2' as the sum minus 't'.
                var   t2   =   sum   -   t ;
                // Add the next element to 'total'.
                var   total   =   total   +   ar[i+1] ;
                // Debugging log: // console.log(total,ar[i+1]);
            }
            else
            {
                // Debugging log: // console.log(total);
                // Calculate 'total2' when the condition is met.
                var   total2   =   sum   -   total ;
                // Break out of the loop as the partition is found.
                break ;
            }
        } // End of partition loop.
    } // End of else block for n == 2.

    /*
     * More commented-out debugging statements.
     * // console.log(t,t2);
     * // console.log(total,total2);
     */

    // Conditional logic based on the value of 'n'.
    if  (   n   ==   3   )
    {
        // Calculate the difference for n=3.
        z   =   total   -   total2 ;
        // Debugging log: // console.log (z);
        // Output the absolute difference.
        console .  log ( Math .  abs ( z ) ) ;
    }
    else
    {
        // Calculate 'P' based on 'total' and 'total2'.
        P   =   total   -   total2 ;
        // Calculate 'x' using 'total' and an element from 'ar'.
        x   =   (   total   +   ar[i+2]   ) ;
        // Debugging log: // console.log(i,ar[i]);
        // Calculate 'Q' based on 't' and 't2'.
        Q   =   t   -   t2 ;
        // Debugging log: // console.log(P,Q);

        // Take absolute values of 'P' and 'Q'.
        P   =   Math .  abs ( P ) ;
        Q   =   Math .  abs ( Q ) ;

        // Compare 'P' and 'Q' and output the smaller one.
        if  ( P   <   Q )
        {
            console .  log ( P ) ;
        }
        else
        {
            console .  log ( Q ) ;
        }
    } // End of else block for n == 3.

} // End of Main function.

// This line handles input reading and function invocation.
// Do not modify this section as it is part of the standard input/output mechanism.
Main ( require ( "fs" ) .  readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;