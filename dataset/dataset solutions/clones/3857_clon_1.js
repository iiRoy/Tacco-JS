"use strict"; // Enforce strict mode for better code quality and error handling

// This is the primary function that orchestrates the entire process.
// It takes input, processes it, and prints the result to the console.
function main(input)
{
    // Define a constant for the maximum limit, used in array sizing and sieve.
    const MAX = 55555;

    // Parse the input string into an integer. The '10' specifies base-10.
    const n = parseInt(input, 10);

    // Initialize a boolean array (sieve) to mark prime numbers.
    // The size is determined by the MAX constant.
    const sieve = new Array(MAX);

    // Populate the sieve array, initially marking all numbers as potentially prime.
    for ( let i = 0 ; i < MAX ; i++ )
    {
        sieve[i] = true;
    }

    // Calculate the square root of MAX for optimization in the sieve algorithm.
    let max = Math.floor(Math.sqrt(MAX));

    // 0 and 1 are not considered prime numbers, so mark them as false.
    sieve[0] = false;
    sieve[1] = false;

    // Implement the Sieve of Eratosthenes algorithm.
    // Iterate from 2 up to the square root of MAX.
    for ( let i = 2 ; i <= max ; i++ )
    {
        // If 'i' is currently marked as prime...
        if ( sieve[i] )
        {
            // Mark all multiples of 'i' (starting from i*2) as not prime.
            // This effectively removes non-prime numbers from the sieve.
            for ( var j = i * 2 ; j <= MAX ; j += i )
            {
                sieve[j] = false;
            }
        }
    }

    // This array will store the found prime numbers that meet certain criteria.
    let nums = [];

    // Initialize a counter for iterating through the sieve.
    let i = 0;

    // Loop indefinitely until the required 'n' numbers are found and validated.
    while ( true )
    {
        // If the current number 'i' is marked as prime in the sieve...
        if ( sieve[i] )
        {
            // Add it to our 'nums' array.
            nums.push(i);
        }

        // Once we have 'n' numbers in our 'nums' array...
        if ( nums.length === n )
        {
            // Check if this set of 'n' numbers is valid according to the isValid function.
            if ( isValid(nums) )
            {
                // If valid, print the numbers joined by spaces and exit the main function.
                console.log(nums.join(' '));
                return; /* Exit after finding the solution */
            }

            // If not valid, remove the oldest number (first element) from the array.
            // This creates a sliding window effect to check new combinations.
            nums = nums.slice(1);
        }

        // Increment the counter to check the next number in the sieve.
        i += 1;
    }

    // --- Nested Helper Function: isValid ---
    // This function checks if a given array of 'values' meets specific criteria.
    // Specifically, it checks if any combination of 5 numbers from 'values' sums to a non-prime number.
    function isValid(values)
    {
        // Generate all possible combinations of 5 elements from the input 'values' array.
        let comb = combinations(values, 5);

        // Iterate through each generated combination.
        for ( let i = 0 ; i < comb.length ; i += 1 )
        {
            // Calculate the sum of elements in the current combination.
            const sum = comb[i].reduce((acc, val) => acc + val);

            // If the sum is NOT a prime number (i.e., sieve[sum] is false),
            // then this set of values is considered invalid, and we return true.
            // Note: The original code has `return !sieve[sum];` inside the loop,
            // which means it returns after checking only the first combination.
            // This behavior is preserved as per Type I cloning rules.
            return !sieve[sum];
        }
        // If no combination of 5 was found, or if all sums were prime, return false.
        // (This part of the code is only reached if 'comb' is empty or the loop finishes without returning,
        // which implies the previous `return` statement's behavior.)
        return false;
    }
} /* End of main function */

// --- Helper Function: combinations ---
// This function generates all unique combinations of 'k' elements from a given 'set'.
function combinations( set , k )
{
    var i, j, combs, head, tailcombs; // Declare variables used in the function.

    // Base case 1: If 'k' is greater than the set size or non-positive, no combinations are possible.
    if ( k > set.length || k <= 0 )
    {
        return [];
    }

    // Base case 2: If 'k' is equal to the set size, there's only one combination: the set itself.
    if ( k == set.length )
    {
        return [set];
    }

    // Base case 3: If 'k' is 1, each element of the set forms a combination.
    if ( k == 1 )
    {
        combs = []; // Initialize an array to store combinations.
        for ( i = 0 ; i < set.length ; i++ )
        {
            combs.push([set[i]]); // Each element becomes a single-element array.
        }
        return combs;
    }

    // Recursive step: Generate combinations for k > 1.
    combs = []; // Initialize the array for combinations.

    // Iterate through the set, taking each element as the 'head' of a combination.
    for ( i = 0 ; i < set.length - k + 1 ; i++ )
    {
        // Extract the current element as the 'head'.
        head = set.slice(i, i + 1);

        // Recursively find combinations of 'k-1' elements from the rest of the set.
        // The 'rest' starts from the element after the current 'head'.
        tailcombs = combinations(set.slice(i + 1), k - 1);

        // Combine the 'head' with each 'tailcombination'.
        for ( j = 0 ; j < tailcombs.length ; j++ )
        {
            combs.push(head.concat(tailcombs[j]));
        }
    }

    // Return the accumulated combinations.
    return combs;
} /* End of combinations function definition */

// Read input from standard input and pass it to the main function.
// This line typically executes the program in a Node.js environment.
main ( require('fs') .readFileSync('/dev/stdin', 'utf8') ) ;