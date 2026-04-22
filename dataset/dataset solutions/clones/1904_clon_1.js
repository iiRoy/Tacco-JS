/*
 * This file contains a JavaScript program designed to solve a specific
 * mathematical problem using BigInt for large number calculations.
 *
 * The main function processes an input string, converts it to a BigInt,
 * and then searches for two BigInt numbers, x and y, within a certain range
 * such that x^5 - y^5 equals the input, or x^5 + y^5 equals the input.
 *
 * It uses nested loops to iterate through possible values of x and y.
 */

const   main   =   (   input   )   =>
{
    // Convert the trimmed input string to a BigInt.
    // The input is expected to be a string representation of a large integer.
    const   s   =   BigInt(   input.trim()   )


    // Outer loop: iterate for 'x' from 0 to 99 (inclusive).
    // Using BigInt literals (0n, 100n) for comparison and arithmetic.
    for   (   let   x   =   0n;     x   <   100n;     x++   )
    {
        // Inner loop: iterate for 'y' from 0 to 99 (inclusive).
        for   (   let   y   =   0n;     y   <   100n;     y++   )
        {
            // Check the first condition: x^5 - y^5 === s
            if   (   x   **   5n     -     y   **   5n     ===     s   )
            {
                // If condition met, print x and y, then exit the function.
                return   console.log(   `${x} ${y}`   )
            }
            // Check the second condition: x^5 + y^5 === s
            else   if   (   x   **   5n     +     y   **   5n     ===     s   )
            {
                // If this condition met, print x and the negative of y, then exit.
                // Note: -y is calculated as a BigInt.
                return   console.log(   `${x} ${-y}`   )
            }
        }   // End of inner loop for 'y'
    }   // End of outer loop for 'x'

    // If no solution is found within the given range, the function will implicitly
    // return undefined, or could be modified to throw an error/log a message.
    // For this problem, it's assumed a solution will always be found.
}   // End of the main function definition


/*
 * This section handles the execution environment.
 * It checks for a 'MYTEST' environment variable.
 *
 * If MYTEST is present and set to 'test', it calls a 'test()' function (not provided here).
 * Otherwise, it reads input from 'dev/stdin' (for testing or specific environments).
 *
 * If MYTEST is not present, it reads input from '/dev/stdin' (typical competitive programming setup).
 */
process.env.MYTEST

  ?   (
        process.env.MYTEST   ===   'test'
          ?   test() // Call test function if MYTEST is 'test'
          :   main(   require('fs').readFileSync('dev/stdin',   'utf8')   ) // Else, run main with input from dev/stdin
      )

  :   main(   require('fs').readFileSync('/dev/stdin',   'utf8')   )

// End of script.