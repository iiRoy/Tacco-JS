/* This file enforces strict parsing and error handling for better code quality. */
'use strict'
// A blank line for visual separation.

// This function calculates the factorial of a given non-negative integer.
// It uses recursion to achieve this.
function    factorialize  (   num    )   {

    // Base case: The factorial of 0 is defined as 1.
    if  (   num   ===    0    )
    {
        return    1   ;    // Return 1 for the base case.
    }

    // Recursive step: n! = n * (n-1)!
    return     num    *     factorialize    (    num   -   1    )   ;
}


// This function counts the number of divisors for a given positive integer.
function   divisor   (   num   )   {
    let    cnt    =    0   ;     // Initialize a counter for divisors.

    /*
     * Loop through all numbers from 0 up to the given number.
     * Note: Division by zero (i=0) will result in NaN for num % i.
     * In JavaScript, `NaN === 0` is false. So `num % 0 === 0` is false.
     * This effectively skips i=0 without an explicit check, which is okay for divisor count logic.
     */
    for    (    let    i   =   0   ;    i   <=   num   ;    i++    )
    {
        // Check if 'i' is a divisor of 'num'.
        if    (    num   %   i   ===   0    )
        {
            cnt    +=    1   ;     // Increment the counter if 'i' is a divisor.
        }
    }
    return     cnt   ;    // Return the total count of divisors.
}


// The main entry point of the program.
function    Main    (    input    )   {
    // Convert the input string to a number.
    const    num    =    Number    (    input    )   ;

    // Calculate the factorial of the parsed number.
    const    f    =    factorialize    (    num    )   ;

    // Calculate the number of divisors for the factorial and print it to the console.
    console    .    log    (    divisor    (    f    )    )   ;
}

// Execute the Main function with input read from standard input.
// This line reads the entire content of stdin as a UTF-8 string.
Main    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"   ,    "utf8"    )    )   ;