/* This script reads input from standard input,
 * processes it, and prints results to standard output.
 * It's a simple program for data manipulation. */

 // Declare a variable to store the raw input data.
 var   input   =   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   ;

 // Process the input: trim whitespace and split into an array of lines.
 var   Arr   =   (   input   .   trim   (   )   )   .   split   (   "\n"   )   ;


// Main loop to iterate through the array, processing chunks of data.
 for   (   var   I   =   0   ;   I   <   Arr   .   length   ;   I   ++   )
 {
    // Convert the current array element to a number (by subtracting zero).
    var   Sum   =   Arr   [   I   ]   -   0   ;

    // If the current sum is zero, it's a termination condition.
    if   (   Sum   ==   0   )
    {
        break   ;   // Exit the loop.
    }

    // Initialize a local sum variable for the next 10 elements.
    var   sum   =   0   ;

    // Loop through the next 10 elements, starting from the current 'I'.
    for   (   var   i   =   0   ;   i   <   10   ;   i   ++   )
    {
        // Add the numeric value of each element to 'sum'.
        sum   +=   (   Arr   [   I   +   i   ]   -   0   )   ;
    }

    // Output the difference between the initial 'Sum' and the calculated 'sum'.
    console   .   log   (   Sum   -   sum   )   ;

    // Advance the main loop counter by 10, as 10 elements were processed.
    I   +=   10   ;
 }
// End of script.