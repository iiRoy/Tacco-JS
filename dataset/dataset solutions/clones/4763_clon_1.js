/*
 * This file contains two JavaScript functions:
 * 1. factorization1: Computes the prime factorization of a given number.
 * 2. main: Reads input, calculates the number of divisors for a factorial,
 *    and prints the result.
 */

// Function to find the prime factorization of a number 'n'
function factorization1 (n)
{
    // Initialize an empty array to store prime factors and their exponents.
    let primes = [];

    /*
     * Iterate from i=2 up to sqrt(n) to find prime factors.
     * This optimization avoids checking divisors larger than sqrt(n).
     */
    for (let i = 2; (i * i) <= n; i++)
    {
        // Initialize exponent for the current prime candidate 'i'.
        let exponent = 0;

        // While 'i' divides 'n', increment exponent and divide 'n' by 'i'.
        while ((n % i) === 0)
        {
            n = (n / i); // Update n
            exponent++; // Increment count
        }

        // If 'i' was a factor (exponent > 0), add it to the primes list.
        if (exponent)
        {
            primes . push ( { p: i, e: exponent } );
        }
    }

    // If 'n' is still greater than 1 after the loop, it means
    // the remaining 'n' is a prime factor itself.
    if (n !== 1)
    {
        primes . push ( { p: n, e: 1 } ); // Add the remaining prime with exponent 1.
    }

    // Return the list of prime factors.
    return primes;
}


/*
 * The main function processes the input and calculates the desired result.
 * It computes the number of divisors for N! (N factorial) modulo MOD.
 */
function main (arg)
{
        // Convert the input argument to a number, typically N.
    let N = Number (arg);

        // Define the modulo constant.
    let MOD = (10 ** 9) + 7;


    // An object to store the aggregated prime factors and their total exponents for N!.
    let factors = {};

    /*
     * Loop from 1 to N, factorizing each number 'i' and aggregating
     * its prime factors into the 'factors' object.
     */
    for (let i = 1; i <= N; i++)
    {
        // Get the prime factorization of the current number 'i'.
        let tmpFactors = factorization1 (i);

        // Iterate over each prime factor 'f' found for 'i'.
        tmpFactors . forEach (f => {
            // If the prime 'f.p' already exists in 'factors', add its exponent 'f.e'.
            if (factors [f.p])
            {
                factors [f.p] += f.e;
            }
            // Otherwise, add the new prime factor with its exponent.
            else
            {
                factors [f.p] = f.e;
            }
        });
    }

    // Log the aggregated prime factors for debugging or inspection.
    console.log (factors);


    // Initialize the answer (number of divisors) to 1.
    let ans = 1;

    /*
     * Calculate the total number of divisors using the formula:
     * (e1+1) * (e2+1) * ... * (ek+1) mod MOD,
     * where e1, e2, ... ek are the exponents of the distinct prime factors.
     */
    Object . keys (factors) . forEach (f => {
        ans *= (factors [f] + 1); // Multiply by (exponent + 1)
        ans %= MOD;               // Apply modulo operation
    });

    // Log the final calculated answer.
    console.log (ans);
}

// Execute the main function with input read from stdin.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin", "utf8" ) );