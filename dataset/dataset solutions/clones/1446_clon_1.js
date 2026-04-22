/*
 * This is a Type I clone of the original JavaScript code.
 * As per the definition, only whitespace and comments have been altered.
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged from the source code.
 */

function   Main   (   input   )   {

    // Initialize an array 'arr' by processing the input string.
    // The input is trimmed, split by whitespace or newline, and then
    // each resulting string is converted to a Number.
    var   arr   =   input . trim ( ) . split (   / \s | \n /   ) . map (   Number   )   ;


    // Start an infinite loop to process multiple sets of data.
    // This loop continues until a specific termination condition is met.
    while   (   1   )   {

        // Extract the first number from the 'arr' array.
        // This number 'n' represents the count of subsequent data points.
        n   =   arr . shift ( )   ;


        // Check if 'n' is zero. If it is, this signifies the end of input
        // and the loop should be terminated.
        if   (   n   ==   0   )
        {
            break   ; // Exit the while loop.
        }


        // Declare and initialize a new array 'a' with a size of 'n'.
        // This array will store the 'n' data points for the current test case.
        a   =   new   Array   (   n   )   ;

        // Initialize 'sum' to zero. This variable will accumulate the sum
        // of the data points to calculate the mean.
        sum   =   0   ;

        // Initialize 'v' to zero. This variable will accumulate the sum
        // of squared differences from the mean, used for variance calculation.
        v   =   0   ;


        // First loop: Iterate 'n' times to read data points and calculate their sum.
        for   (   var   i   =   0   ;   i   <   n   ;   i   ++   )   {
            // Read the next data point from 'arr' and assign it to a[i].
            a   [   i   ]   =   arr . shift ( )   ;
            // Add the current data point to the running total 'sum'.
            sum   +=   a   [   i   ]   ;
        }


        // Calculate the mean (average) of the 'n' data points.
        sum   /=   n   ;


        // Second loop: Iterate 'n' times to calculate the sum of squared differences.
        // This is a key step in computing the variance.
        for   (   var   i   =   0   ;   i   <   n   ;   i   ++   )   {
            // Calculate the difference between the current data point and the mean,
            // square this difference, and add it to 'v'.
            v   +=   Math . pow   (   a   [   i   ]   -   sum   ,   2   )   ;
        }


        // Finally, calculate the standard deviation.
        // This is the square root of the variance (v / n).
        // The result is then printed to the console.
        console . log   (   Math . sqrt   (   v   /   n   )   )   ;

    }   // End of the while loop for processing test cases.

}   // End of the Main function definition.


// The main function call.
// It reads the entire content of '/dev/stdin' as a UTF-8 string
// and passes it as input to the 'Main' function.
Main   (   require   (   "fs"   ) . readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;

/* End of the cloned JavaScript code. */