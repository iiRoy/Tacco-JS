'use strict'
// This script implements a solution to find the number of 10000-yen, 5000-yen, and 1000-yen bills
// that sum up to a specific total amount, given a total number of bills.
// It's often referred to as the "Otoshidama" problem in programming contests.


/**
 *  The main function that solves the Otoshidama problem.
 *  It takes a string input containing two space-separated numbers:
 *  the total number of bills (n) and the target total amount (y).
 *
 *  @param { string } stdin - The standard input string.
 */
function otoshidama( stdin )
{
    // Split the input string into an array of strings based on the space character.
    const inputs = stdin.split( ' ' );


    // Extract the total number of bills.
    // JavaScript will implicitly convert this string to a number when used in arithmetic operations.
    const n = inputs[0];


    // Extract the target total amount.
    // Similar to 'n', this string will be coerced to a number during calculations.
    const y = inputs[1];


    // Begin iterating through possible counts for 10000-yen bills.
    // 'i' represents the number of 10000-yen bills.
    // It can range from 0 up to 'n' (the total number of bills).
    for ( let i = 0;  i <= n;  i++ )
    {
        // Calculate the remaining amount after subtracting the value of 10000-yen bills.
        // (y - (10000 * i))
        const remain = y - 10000 * i;


        // Check for an immediate solution: if the remaining amount is zero,
        // and we've used all 'n' bills as 10000-yen bills.
        if ( remain === 0  &&  n === i )
        {
            // If this condition is met, we've found the unique solution:
            // n 10000-yen bills, 0 5000-yen bills, and 0 1000-yen bills.
            // Output the result and exit the function.
            return console.log( n,  0,  0 );
        }
        // Optimization: If the remaining amount is already non-positive,
        // and we still have bills left to account for (i < n),
        // then increasing 'i' further will only make 'remain' more negative.
        // Therefore, any combination with more 10000-yen bills will exceed the target.
        // In this case, we can break out of the outer loop.
        else if ( remain <= 0  &&  i < n )
        {
            break; // No need to check for 5000 or 1000 yen bills if already over budget.
        }


        // Nested loop: Iterate through possible counts for 5000-yen bills.
        // 'j' represents the number of 5000-yen bills.
        // It can range from 0 up to the remaining available bills (n - i).
        for ( let j = 0;  j <= n - i;  j++ )
        {
            // Calculate the number of 1000-yen bills ('sen').
            // This is determined by subtracting the counts of 10000-yen (i)
            // and 5000-yen (j) bills from the total number of bills (n).
            const sen = n - i - j;


            // Calculate the total value of the current combination of bills.
            // This is the 'remain' amount minus the value of 5000-yen and 1000-yen bills.
            const result = remain - 5000 * j - 1000 * sen;


            // Check if the calculated 'result' is exactly zero.
            // If it is, this means the current combination of bills perfectly matches the target amount.
            if ( result === 0 )
            {
                // A solution has been found: output the counts for i, j, and sen.
                // Then, terminate the function.
                return console.log( i,  j,  sen );
            }
            // Optimization: If 'result' is already less than 1000,
            // it implies that the remaining amount cannot be formed by 1000-yen bills alone,
            // or we've already overshot the target amount.
            // Since 'sen' is positive or zero, increasing 'j' would only make 'result' smaller (more negative).
            // Thus, no further combinations with this 'i' and increasing 'j' will be valid.
            else if ( result < 1000 )
            {
                break; // Exit the inner loop.
            }
        }
    }

    // If the loops complete without finding any valid combination,
    // it means no solution exists for the given 'n' and 'y'.
    // Output -1 for all three bill counts to indicate no solution.
    return console.log( -1,  -1,  -1 );
}


// Read input from standard input (file descriptor 0) using Node.js 'fs' module.
// The input is read synchronously and decoded as 'utf8' text.
// The 'otoshidama' function is then called with this input.
otoshidama( require( 'fs' ).readFileSync( 0,  'utf8' ) );