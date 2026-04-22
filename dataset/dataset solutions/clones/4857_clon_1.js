/*
 * This JavaScript file processes input data according to specific rules.
 * It simulates a process of reducing a list of numbers iteratively.
 */

function   Main  (  input  )
{
    // The main function that orchestrates the entire process.
    // It takes the raw input string as an argument.

    var  data  =  input.split (  "\n"  )   ;  // Split the input string by newline characters
                                             // to get an array of lines.

    var   n   =   data [  0  ]   ;   // The first line of input represents 'n',
                                   // which determines the number of iterations for the main loop.

    var   a   =   data.slice (   1   )   ;   // The rest of the lines (from index 1 onwards)
                                           // form the initial array 'a' for processing.

    // This is the primary loop that performs the transformation 'n' times.
    // Each iteration reduces the array 'a' based on specific comparisons.
    for  (  var   i   =   0  ;   i   <   n  ;   ++i  )
    {
        // Inside the main loop, a temporary array 'b' is created for each iteration.
        // This array will store the results of the current iteration's calculations.
        var   b   =   [  ]   ;

        // This nested loop iterates through the 'a' array, taking two elements at a time.
        // It processes pairs of elements to generate new values for array 'b'.
        for  (  var   j   =   0  ;   j   <   a.length   -   1  ;   j   +=   2  )
        {
            // First comparison: If the current element is greater than the next.
            if  (  a [  j  ]   >   a [  j   +   1  ]  )
            {
                // Push the difference (current - next) into array 'b'.
                b.push (  a [  j  ]   -   a [  j   +   1  ]  )   ;
            }
            // Second comparison: If the current element is exactly equal to the next.
            else   if  (  a [  j  ]   ==   a [  j   +   1  ]  )
            {
                // Push the current element itself into array 'b'.
                b.push (  a [  j  ]  )   ;
            }
            // Default case: If the current element is less than the next.
            else
            {
                // Push the difference (next - current) into array 'b'.
                b.push (  a [  j   +   1  ]   -   a [  j  ]  )   ;
            }
        }
        // After processing all pairs in the current iteration,
        // the array 'a' is updated with the new values from 'b'.
        a   =   b   ;
    }

    // Finally, after all 'n' iterations are complete,
    // the first element of the resulting array 'a' is printed to the console.
    console.log (  a [  0  ]  )   ;
}

// This section handles reading the input from standard input and calling the Main function.
// It uses Node.js 'fs' module to read the file synchronously.
Main (  require (  "fs"  ) .  readFileSync (  "/dev/stdin"  ,   "utf8"  )  )   ;