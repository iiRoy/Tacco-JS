function    Main (   input   )
{
    // Initialize input by splitting it into an array of lines.
    input   =   input . split ( "\n" ) ;

    var k = 0 ; // Initialize line counter 'k' to zero.

    while (   1   )   // Begin an infinite loop; it will be broken internally.
    {
        // Split the current line of input by spaces to get individual values.
        input [ k ]   =   input [ k ] . split (   " "   ) ;

        // Parse the first value of the current line as integer 'n'.
        var n   =   parseInt (   input [ k ] [ 0 ]   ,   10   ) ;
        // Parse the second value of the current line as integer 'm',
        // and then increment 'k' for the next line.
        var m   =   parseInt (   input [ k ++ ] [ 1 ]   ,   10   ) ;

        // Check for the termination condition: if both n and m are 0.
        if (   n   ==   0   &&   m   ==   0   )
        {
            break   ;   // Exit the while loop.
        }

        // Declare arrays 'h' and 'w' for storing cumulative sums.
        var h   =   [ ]   ,   w   =   [ ]   ;

        // Initialize the first elements of 'h' and 'w' to 0.
        h [ 0 ]   =   0 ;
        w [ 0 ]   =   0 ;

        // Calculate cumulative sums for 'h' based on 'n' values.
        for (   var i   =   1   ;   i   <=   n   ;   i   ++   )
        {
            // Read next input line, parse as integer, and add to previous sum.
            h [ i ]   =   parseInt (   input [ k ++ ]   ,   10   )   +   h [ i   -   1 ]   ;
        }
        // Calculate cumulative sums for 'w' based on 'm' values.
        for (   var i   =   1   ;   i   <=   m   ;   i   ++   )
        {
            // Read next input line, parse as integer, and add to previous sum.
            w [ i ]   =   parseInt (   input [ k ++ ]   ,   10   )   +   w [ i   -   1 ]   ;
        }

        // Declare arrays 'edgeh' and 'edgew' to store frequencies of differences.
        var edgeh   =   [ ]   ,   edgew   =   [ ]   ;

        // Initialize 'edgeh' and 'edgew' arrays with zeros up to index 1000.
        for (   var i   =   0   ;   i   <=   1000   ;   i   ++   )
        {
            edgeh [ i ]   =   edgew [ i ]   =   0   ;
        }

        // Calculate differences for 'h' and store their frequencies in 'edgeh'.
        for (   var i   =   0   ;   i   <=   n   ;   i   ++   )
        {
            for (   var j   =   i   +   1   ;   j   <=   n   ;   j   ++   )
            {
                edgeh [   h [ j ]   -   h [ i ]   ]   ++   ;
            }
        }
        // Calculate differences for 'w' and store their frequencies in 'edgew'.
        for (   var i   =   0   ;   i   <=   m   ;   i   ++   )
        {
            for (   var j   =   i   +   1   ;   j   <=   m   ;   j   ++   )
            {
                edgew [   w [ j ]   -   w [ i ]   ]   ++   ;
            }
        }

        var ans   =   0   ;   // Initialize the answer variable.

        // Calculate the final answer by summing the products of frequencies
        // for matching differences.
        for (   var i   =   1   ;   i   <=   1000   ;   i   ++   )
        {
            ans   +=   edgeh [ i ]   *   edgew [ i ]   ;
        }

        // Print the calculated answer to the console.
        console . log (   ans   )   ;
    }
}
// Call the Main function with input read from standard input.
Main (   require (   "fs"   ) . readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;