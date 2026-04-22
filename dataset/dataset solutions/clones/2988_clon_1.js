'use strict'
/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact logical and structural identity.
 * Only whitespace and comments have been altered.
 */

function Main(input)
{
    // Convert the input string to a number, trimming whitespace.
    const N = input.trim() - 0;

    // Handle the base case where N is 1.
    if (N === 1)
    {
        console.log(0); // If N is 1, there are no proper divisors except 1, and N/r - 1 > r would not hold.
        return;          // Exit the function early for this specific case.
    }

    /*
     * Sieve of Eratosthenes to find primes up to sqrt(N).
     * M is set to a value slightly larger than sqrt(N) to ensure all relevant primes are found.
     */
    const M = Math.floor(Math.sqrt(N)) + 1;

    // Initialize an array to track primality.
    const isPrime = [];

    // Assume all numbers up to M are prime initially.
    for (let i = 0; i < M; i++)
    {
        isPrime[i] = true;
    }

    // 0 and 1 are not prime numbers.
    isPrime[0] = isPrime[1] = false;

    // Apply the Sieve algorithm.
    for (let i = 0; i < M; i++)
    {
        if (!isPrime[i])
        {
            // If 'i' is not prime, skip to the next number.
            continue;
        }

        /*
         * Mark multiples of 'i' as not prime.
         * Start from i*2 because multiples less than i*2 would have been marked by smaller primes.
         */
        for (let j = 2; i * j <= M; j++)
        {
            isPrime[i * j] = false;
        }
    }

    // Collect all prime numbers found by the sieve.
    const primes = [];
    for (let i = 0; i <= M; i++)
    {
        if (isPrime[i])
        {
            primes.push(i); // Add the prime number to the list.
        }
    }

    /*
     * Perform prime factorization of N.
     * `factorized` will store the exponents for each prime factor.
     */
    const factorized = [];
    for (let i = 0; i <= primes.length; i++)
    {
        factorized[i] = 0; // Initialize exponents to zero.
    }

    var n = 1; // 'n' tracks the product of prime factors found so far.
    let i = 0; // 'i' is the index for the 'primes' array.

    // Loop until 'n' reaches 'N' or all primes have been checked.
    while (n < N)
    {
        // Continuously divide N by primes[i] as long as it's divisible.
        while (N % (n * primes[i]) === 0)
        {
            factorized[i]++; // Increment the exponent for primes[i].
            n *= primes[i];  // Update the product 'n'.
        }
        i++; // Move to the next prime.

        // If all primes have been checked, break the loop.
        if (i === primes.length)
        {
            break;
        }
    }

    /*
     * `concentrated` will store prime factors and their exponents as [prime, exponent] pairs.
     * This makes it easier to work with only the actual factors.
     */
    const concentrated = [];
    factorized.forEach(function (e, i)
    {
        // Only include primes that actually divide N (exponent >= 1).
        if (e >= 1)
        {
            concentrated.push([primes[i], e]);
        }
    });

    // If N is a prime number itself (or 1, which is handled), concentrated will be empty.
    if (concentrated.length === 0)
    {
        concentrated.push([N, 1]); // Add N itself as a factor with exponent 1.
    }

    // Example comment: original code had `//console.log(concentrated);` here.
    // This part is commented out for production.

    var ans = 0; // Initialize the answer variable.
    const factor = []; // Temporary array to store factors during iteration.

    // Calculate L, the total number of divisors of N.
    // L is the product of (exponent + 1) for each prime factor.
    const L = concentrated.reduce((acc, cur) => acc * (cur[1] + 1), 1);

    // Another example comment: `//console.log(concentrated);` was here.

    /*
     * Iterate through all possible combinations of exponents to generate each divisor 'r' of N.
     * This uses a mixed-radix system to generate all divisors.
     */
    for (let l = 0; l < L; l++)
    {
        let m = l; // 'm' is a temporary variable used in the mixed-radix conversion.

        concentrated.forEach(function (cur, i)
        {
            let p = cur[0]; // Current prime factor.
            let e = cur[1]; // Current prime factor's maximum exponent.

            // Calculate the exponent for the current prime factor for this divisor.
            factor[i] = [p, m % (e + 1)];
            // Update 'm' for the next prime factor.
            m = (m - m % (e + 1)) / (e + 1);
        });

        // Example comment: `//console.log(factor);` was here.

        // Reconstruct the divisor 'r' from its prime factors and their calculated exponents.
        let r = factor.reduce((acc, cur) => acc * (Math.pow(cur[0], cur[1])), 1);

        // Example comment: `//console.log(r);` was here.

        // Check the condition N/r - 1 > r.
        // If true, increment the answer.
        // This condition implies N/r > r + 1, or N > r*(r+1).
        // This is effectively counting numbers 'r' such that 'r' is a divisor of N,
        // and N / r is a divisor of N, and N / r - 1 is greater than r.
        // This is equivalent to counting proper divisors 'r' such that r * (r+1) < N.
        if (N / r - 1 > r)
        {
            ans += N / r - 1;
        }
    }

    // Output the final computed answer.
    console.log(ans);
}

// Read input from standard input and pass it to the Main function.
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* End of Type I clone. */