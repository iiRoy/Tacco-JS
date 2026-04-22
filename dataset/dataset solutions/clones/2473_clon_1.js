/*
 * This file contains a JavaScript program designed to solve a specific
 * mathematical problem related to factorization and minimization.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27 (Simulated)
 * Version: 1.0.0
 *
 * The 'use strict' directive ensures that the code runs in strict mode,
 * which helps catch common coding errors and "unsafe" actions.
 */
'use strict'
; // Enforce strict mode for cleaner code execution.

/**
 * Main function to process input and compute the result.
 * It reads a number 'n' from the input and finds the minimum value
 * of 'i - 2 + n / i' where 'i' is a divisor of 'n'.
 *
 * @param {string[]} input - An array of strings representing the input lines.
 *                           The first element is expected to be a string
 *                           that can be parsed into an integer 'n'.
 */
const    main    =    (    input    )    =>
{
    // Parse the first element of the input array into an integer 'n'.
    // This 'n' is the number for which we need to find divisors.
    const    n    =    parseInt    (    input    [    0    ]    )    ;

    /*
     * Initialize 'ans' (answer) with a very large number.
     * This acts as an initial maximum value for comparison during
     * the minimization process. Any valid calculated value should
     * be smaller than this initial 'ans'.
     */
    let    ans    =    10000000000000    ; // A sufficiently large initial value to ensure any valid result is smaller.

    // Loop through possible divisors 'i' from 1 up to the square root of 'n'.
    // We only need to check up to Math.sqrt(n) because if 'i' is a divisor,
    // then 'n/i' is also a divisor.
    for    (    let    i    =    1    ;    i    <=    Math.floor    (    Math.sqrt    (    n    )    )    ;    i    ++    )
    {
        // Check if 'i' is a divisor of 'n' using the modulo operator.
        // If the remainder of n divided by i is 0, then i is a divisor.
        if    (    n    %    i    ==    0    )
        {
            // If 'i' is a divisor, then we have a pair of factors: (i, n/i).
            // We need to calculate 'i - 2 + n/i' and compare it with the current 'ans'.
            // If the calculated value is smaller, update 'ans'.
            if    (    ans    >    i    -    2    +    n    /    i    )
            {
                // Assign the new minimum value found to 'ans'.
                ans    =    i    -    2    +    n    /    i    ;
            }
        }
    }

    // After iterating through all relevant divisors, 'ans' will hold
    // the minimum value of 'i - 2 + n/i'.
    // Print this final minimum value to the standard output.
    console    .    log    (    ans    )    ;

} // End of the main function definition.

/*
 * --- Program Execution Start Point ---
 *
 * This block of code is responsible for reading the input and
 * initiating the main computation.
 *
 * 1. `require("fs")`: Imports the Node.js 'fs' (file system) module.
 * 2. `.readFileSync("/dev/stdin", "utf8")`: Reads the entire content
 *    of the standard input stream ('/dev/stdin') as a UTF-8 encoded string.
 * 3. `.split('\n')`: Splits the read string into an array of substrings,
 *    using the newline character ('\n') as a delimiter. Each element
 *    of this array represents a line from the input.
 * 4. `main(...)`: Calls the 'main' function with the processed input array.
 *
 * --- End of Execution Block ---
 */
main    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    .    split    (    '\n'    )    )    ;