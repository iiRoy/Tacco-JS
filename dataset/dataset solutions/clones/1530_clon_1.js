/*
 * This JavaScript file defines a constant and two functions.
 * It calculates a specific mathematical expression modulo a large prime number.
 */

// Define a constant for the modulo operation.
// This value is 10^9 + 7, a common prime number used in competitive programming.
const mod = 10 ** 9 + 7;


/**
 * Calculates (x^y) % mod efficiently using a simple loop.
 *
 * @param {number} x - The base number.
 * @param {number} y - The exponent.
 * @returns {number} The result of (x^y) % mod.
 */
function     pow (  x  ,  y  )   {

    // Initialize the result variable to 1.
    var   r   =   1;

    // Loop 'y' times to perform modular exponentiation.
    for ( var   i   =   0  ;  i   <   y  ;    i++   )
        {
        // Multiply 'r' by 'x' and take modulo 'mod' in each iteration.
        r = r   *   x   %   mod;
        }

    // Return the final calculated value.
    return   r;
}


/**
 * The main function to process input and output the result.
 * It calculates a complex expression involving powers and modulo.
 *
 * The expression is: (10^num - 2 * 9^num + 8^num) % mod
 * It also handles negative results from the modulo operation by adding 'mod' before the final modulo.
 *
 * @param {string} input - The input string, expected to be a number.
 */
function Main (  input  )  {

    // Parse the input string into an integer.
    var   num   =   parseInt (  input  )  ;

    // Calculate the core expression: (pow(10, num) - (pow(9, num) * 2) + pow(8, num))
    // Note: The intermediate result 'r' here might be negative before the final modulo.
    var   r   =   pow (  10  ,   num  )   -   (  pow (  9  ,   num  )   *   2  )   +   pow (  8  ,   num  )

    // Apply the modulo operation to the calculated 'r'.
    r   =   r   %     mod  ;

    // Ensure the result is non-negative by adding 'mod' and taking modulo again.
    // This handles cases where 'r' might be negative after the first modulo.
    r = (  r   +   mod     )   %     mod  ;

    // Output the final computed result to the console.
    console.log (  r  )
}

// Read input from standard input and pass it to the Main function.
// This is a common pattern for competitive programming in Node.js.
Main (  require (  "fs"  )  .  readFileSync (  "/dev/stdin"  ,   "utf8"  )  )  ;