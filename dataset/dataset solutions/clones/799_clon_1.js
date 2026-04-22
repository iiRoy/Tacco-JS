/* This is the main function that processes the input data. */
function   Main   (   input   )
{
    // The input is initially a single string.
    // We split it by newline characters to get an array of lines.
    input = input . split ( "\n" ) ;

    // Initialize an index 'k' to keep track of the current line being processed.
    var   k   =   0   ;

    // This loop continues indefinitely until a specific break condition is met.
    while   (   1   )
    {
        /*
         * Each line within the loop contains space-separated values.
         * We split the current line 'input[k]' by spaces.
         */
        input [ k ]   =   input [ k ] . split ( " " ) ;

        // Parse the first value of the current line as an integer 'n'.
        var   n   =   parseInt ( input [ k ] [ 0 ]   ,   10 ) ;

        // Parse the second value of the current line as an integer 'm'.
        // The 'k++' increments 'k' after accessing input[k][1].
        var   m   =   parseInt ( input [ k ++ ] [ 1 ]   ,   10 ) ;

        /*
         * Check for the termination condition: if both 'n' and 'm' are zero.
         * If true, exit the processing loop.
         */
        if   (   n   ==   0   &&   m   ==   0   )
        {
            break   ; // Exit the while loop.
        }

        // Declare two arrays, 'h' and 'w', to store cumulative sums for heights and widths.
        var   h   =   [ ]   ,   w   =   [ ]   ;

        // Initialize the first element of both arrays to 0.
        h [ 0 ]   =   0   ;
        w [ 0 ]   =   0   ;

        // Calculate cumulative sums for heights.
        // 'k' is incremented inside parseInt, so it reads the next line for each height.
        for   (   var   i   =   1   ;   i   <=   n   ;   i   ++   )
        {
            h [ i ]   =   parseInt ( input [ k ++ ]   ,   10 )   +   h [ i   -   1 ]   ;
        }

        // Calculate cumulative sums for widths.
        // Similar to heights, 'k' is incremented to read the next line for each width.
        for   (   var   i   =   1   ;   i   <=   m   ;   i   ++   )
        {
            w [ i ]   =   parseInt ( input [ k ++ ]   ,   10 )   +   w [ i   -   1 ]   ;
        }

        // Declare arrays to store the frequency of differences (edge lengths) for heights and widths.
        var   edgeh   =   [ ]   ,   edgew   =   [ ]   ;

        // Determine the maximum possible edge length to size the frequency arrays.
        var   max   =   h [ n ]   >   w [ m ]   ?   h [ n ]   :   w [ m ]   ;

        // Initialize all elements in 'edgeh' and 'edgew' arrays to zero up to 'max'.
        for   (   var   i   =   0   ;   i   <=   max   ;   i   ++   )
        {
            edgeh [ i ]   =   edgew [ i ]   =   0   ;
        }

        // Calculate the frequency of all possible height differences (edge lengths).
        // For every pair (i, j) where j > i, calculate h[j] - h[i] and increment its count.
        for   (   var   i   =   0   ;   i   <=   n   ;   i   ++   )
        {
            for   (   var   j   =   i   +   1   ;   j   <=   n   ;   j   ++   )
            {
                edgeh [ h [ j ]   -   h [ i ] ]   ++   ;
            }
        }

        // Calculate the frequency of all possible width differences (edge lengths).
        // Similar to heights, for every pair (i, j) where j > i, calculate w[j] - w[i].
        for   (   var   i   =   0   ;   i   <=   m   ;   i   ++   )
        {
            for   (   var   j   =   i   +   1   ;   j   <=   m   ;   j   ++   )
            {
                edgew [ w [ j ]   -   w [ i ] ]   ++   ;
            }
        }

        // Initialize a variable to store the final answer.
        var   ans   =   0   ;

        // Calculate the total number of common square sizes.
        // If an edge length 'i' appears 'edgeh[i]' times for heights and 'edgew[i]' times for widths,
        // then there are 'edgeh[i] * edgew[i]' squares of side length 'i'.
        for   (   var   i   =   1   ;   i   <=   max   ;   i   ++   )
        {
            ans   +=   edgeh [ i ]   *   edgew [ i ]   ;
        }

        // Output the final calculated answer to the console.
        console . log ( ans )   ;
    }
}

// Invoke the Main function with input read from standard input.
// This reads the entire content of /dev/stdin as a UTF-8 string.
Main   (   require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )   )   ;