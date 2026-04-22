/*
 * This JavaScript file implements the Sieve of Eratosthenes algorithm
 * to find prime numbers up to a specified maximum value.
 *
 * It also includes functionality to read input from standard input
 * and display the count of primes found.
 */

// Function definition: getPrimes
// This function calculates the number of prime numbers up to 'max'
function   getPrimes(    max    )
{
    // Initialize an array 'sieve' to mark composite numbers.
    // 'i' and 'j' are loop counters.
    // 'primes' will store the actual prime numbers found.
    var    sieve    =    [    ]    ,
        i    ,
        j    ,
        primes    =    [    ]    ;

    // Iterate from 2 up to the maximum limit 'max'
    for    (    i    =    2    ;    i    <=    max    ;    ++i    )
    {
        // If 'sieve[i]' is false (or undefined), then 'i' is a prime number
        if    (    !sieve[    i    ]    )
        {
                // Add the current prime number 'i' to the 'primes' array
                primes.push(    i    )    ;

            // Mark all multiples of 'i' as composite in the 'sieve' array.
            // Start from 2*i (or i << 1) and increment by 'i'.
            for    (    j    =    i    <<    1    ;    j    <=    max    ;    j    +=    i    )
            {
                sieve[    j    ]    =    true    ; // Mark as non-prime
            }
        }
    }
    // Return the total count of prime numbers found
    return    primes.length    ;
}


// --- Main Program Execution ---

// Read the entire standard input as a string using Node.js 'fs' module.
// The input is expected to be a number.
var    input    =    require(    'fs'    )    .    readFileSync(    '/dev/stdin'    ,    'utf8'    )    ;

// Call the 'getPrimes' function with the parsed input number.
// And print the returned count of primes to the console.
// Note: 'Number.input' is used as per the original code;
// typically, one would use 'Number(input)' to convert the string to a number.
console.log(    getPrimes(    Number.input    )    )    ; // Display the result