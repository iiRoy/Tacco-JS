/*
 * This JavaScript program reads input from standard input,
 * processes it according to specific rules, and then prints
 * the calculated result to the console.
 *
 * It's designed to solve a problem involving two integer values, N and M.
 * The core logic determines an output based on a comparison between N and M,
 * applying one of two distinct mathematical formulas.
 */

// The entire script's logic is wrapped within an Immediately Invoked Function Expression (IIFE).
// The result of this IIFE is then passed directly to console.log for output.
console.log(
    (   args    =>  { // Start of the anonymous arrow function that forms the IIFE's body.
        // The input 'args' is expected to be a string containing two space-separated numbers.

        // Step 1: Process the input string.
        //   - `trim()`: Removes any leading or trailing whitespace from the 'args' string.
        //   - `split`` ``: Splits the string into an array of substrings using a space as the delimiter.
        //   - `map( v => parseInt( v ) )`: Iterates over the array of string numbers,
        //     converting each string element 'v' into an integer using `parseInt()`.
        //   - `const [ N, M ] = ...`: Uses array destructuring to assign the first element
        //     of the processed array to 'N' and the second to 'M'.
        const   [   N,  M   ]   =   args
                                    .trim()         // Remove extra whitespace.
                                    .split` `       // Split the string into parts by space.
                                    .map(   v   =>  parseInt(   v   )   ) // Convert each part to an integer.
                                    ;

        // Step 2: Apply conditional logic based on the values of N and M.
        // This 'if' statement checks a specific relationship between N and M.
        if  (   N   *   2   <=  M   ) // The condition: Is twice N less than or equal to M?
        {
            // If the condition is true, calculate the result using the first formula.
            // The formula is N + floor((M - 2*N) / 4).
            // The result is interpolated into a template literal to ensure it's a string.
            return  `${  N   +   Math.floor(   (   M   -   2   *   N   )   /   4   )   }`  ;
        }
        else // If the initial condition (N * 2 <= M) is false, execute this 'else' block.
        {
            // Calculate the result using the second formula.
            // The formula is floor(M / 2).
            // The result is also interpolated into a template literal.
            return  `${  Math.floor(    M   /   2   )   }`  ;
        }

    }   )   (   // End of the anonymous arrow function definition.
        // This is the argument passed to the IIFE.
        // It reads the entire content of standard input synchronously.
        require(    'fs'    ) // Access Node.js's built-in file system module.
            .readFileSync(  // Read a file synchronously.
                '/dev/stdin',   // The path to the file to read (standard input).
                'utf8'          // Specify the encoding for the input content.
            )
    )   // End of the IIFE invocation.
); // End of the console.log statement.