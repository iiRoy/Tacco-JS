/*
 * This JavaScript code snippet defines a main function that processes a numeric input.
 * It performs a series of calculations based on iteration and conditional logic.
 * The script then calls this main function, providing input read from a file.
 */

const   main  =  (  standardInput  )  =>   {

    // Assign the incoming standardInput to a constant 'x' for clarity.
    const   x   =   standardInput ;

    // Initialize a counter variable. This will accumulate the final result.
    var   count   =   0 ;

    // Initialize a 'difference' variable with the value of 'x'.
    // This variable will be modified iteratively within the loop.
    var   diff   =   x ;

    // Start a for loop that iterates downwards from 11 to 1 (inclusive).
    // The loop variable 'i' represents the current divisor.
    for  (  var   i   =   11 ;   i   >   0 ;   i--  )  {

        // Check if the current divisor 'i' is greater than 6.
        if  (  i   >   6  )  {

            // If 'i' is greater than 6, perform a calculation:
            // Divide 'diff' by 'i', take the floor (integer part), and multiply by 2.
            // Add this result to the 'count' variable.
            count   +=   Math.floor  (  diff   /   i  )   *   2 ;

        }  else  {

            // If 'i' is 6 or less, perform a slightly different calculation:
            // Divide 'diff' by 'i', take the floor (integer part).
            // Add this result to the 'count' variable.
            count   +=   Math.floor  (  diff   /   i  ) ;
        }

        // Update the 'diff' variable by taking its modulo with 'i'.
        // This effectively updates the remaining value for the next iteration.
        diff   =   diff   %   i ;

    } // End of the for loop.

    // Once the loop completes, print the final accumulated 'count' to the console.
    console.log  (  count  ) ;

} // End of the main function definition.


// Immediately invoke the main function.
// It reads the entire content of '/dev/stdin' as a UTF-8 string
// using Node.js's built-in 'fs' module and passes it as input.
main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin' ,   'UTF-8'  )  ) ;