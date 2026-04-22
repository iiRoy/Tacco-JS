/*
 * This file contains two JavaScript functions:
 * 1. factorization1: Computes the prime factorization of a given number.
 * 2. main: Reads input, processes it using factorization1, and prints a result.
 */


/**
 * Calculates the prime factorization of a positive integer 'n'.
 *
 * @param   {number} n  The number to factorize.
 * @returns {Array<Object>} An array of objects, where each object has:
 *                          - p: The prime factor.
 *                          - e: Its exponent.
 */
function factorization1(n)
{
    // Initialize an empty array to store the prime factors and their exponents.
    let primes = [];

    // Iterate from i = 2 up to the square root of n.
    // This efficiently finds all prime factors up to sqrt(n).
    for (let i = 2; i * i <= n; i++)
    {
        // Initialize the exponent for the current potential prime factor 'i'.
        let exponent = 0;

        // Continuously divide 'n' by 'i' as long as 'n' is divisible by 'i'.
        // This counts how many times 'i' is a factor of 'n'.
        while (n % i === 0)
        {
            n /= i; // Reduce 'n' by dividing it by 'i'.
            exponent++; // Increment the exponent for 'i'.
        }

        // If 'i' was a factor (i.e., its exponent is greater than 0),
        // add it to our list of prime factors.
        if (exponent)
        {
            primes.push({ p: i, e: exponent }); // Store the prime factor and its exponent.
        }
    }

    // After the loop, if 'n' is still not 1, it means the remaining 'n'
    // is a prime factor itself (and it only appears once).
    if (n !== 1)
    {
        primes.push({ p: n, e: 1 }); // Add the last remaining prime factor.
    }

    // Return the complete list of prime factors with their exponents.
    return primes;
}


/*
 * The main function responsible for handling the program's logic.
 * It reads an input number N, calculates the product of (exponent + 1)
 * for all prime factors up to N!, modulo a large prime number.
 */
function main(arg)
{
    // Convert the input argument (which is a string) into a number N.
    let N = Number(arg);

    // Define the modulo constant, often used in competitive programming.
    let MOD = 10 ** 9 + 7;


    // Initialize an empty object to store the aggregated prime factors
    // and their total exponents across all numbers from 1 to N.
    let factors = {};

    // Loop through each number from 1 to N.
    for (let i = 1; i <= N; i++)
    {
        // Get the prime factorization for the current number 'i'.
        let tmpFactors = factorization1(i);

        // For each prime factor 'f' found in 'tmpFactors':
        tmpFactors.forEach(f => {
            // Check if this prime factor 'f.p' already exists in our 'factors' object.
            if (factors[f.p])
            {
                // If it exists, add its exponent 'f.e' to the existing total exponent.
                factors[f.p] += f.e;
            }
            else
            {
                // If it doesn't exist, add it to 'factors' with its exponent 'f.e'.
                factors[f.p] = f.e;
            }
        });
    }

    // Initialize the answer variable to 1.
    let ans = 1;

    // Iterate over each unique prime factor (key 'f') collected in the 'factors' object.
    Object.keys(factors).forEach(f => {
        // According to a mathematical property (related to number of divisors),
        // we multiply 'ans' by (exponent + 1) for each prime factor.
        ans *= (factors[f] + 1);

        // Apply the modulo operation to 'ans' to prevent integer overflow
        // and keep the result within the desired range.
        ans %= MOD;
    });

    // Print the final calculated answer to the console.
    console.log(ans);
}

// This line reads input from standard input (e.g., from a file or console pipe)
// and then calls the 'main' function with the read content.
main(require("fs").readFileSync("/dev/stdin", "utf8"));