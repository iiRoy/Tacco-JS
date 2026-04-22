/*
 * This file contains a JavaScript program
 * for processing input and calculating prime numbers.
 * It reads input from standard input,
 * processes it, and then prints the result.
 */

// Configuration object for input/output settings.
const   config =    {

    input:      '/dev/stdin',    // Specifies the input source path.
    newline:    '\n'             // Defines the newline character for splitting input.

};


// Read the entire input file, decode it as UTF-8,
// and then split it into an array of lines using the configured newline character.
const line  =   require('fs')
                .readFileSync(  config.input,
                                'utf-8'  )
                .split(         config.newline  );


/*
 *  Function to determine if a given number 'n' is prime.
 *  A prime number is a natural number greater than 1 that has no positive divisors
 *  other than 1 and itself.
 */
const   isPrime =   n   =>  {

    // Numbers less than 2 are not prime.
    if  (   n   <   2   )
    {
        return  false;
    }

    // 2 is the only even prime number.
    if  (   n   ===   2   )
    {
        return  true;
    }

    // Check for divisibility from 2 up to the square root of n.
    // If n has a divisor greater than its square root, it must also have
    // a divisor smaller than its square root.
    for (   let i   =   2;
            i   *   i   <=  n;
            i++ )
    {
        // If n is divisible by i, then n is not prime.
        if  (   n   %   i   ===   0   )
        {
            return  false;
        }
    }

    // If no divisors were found, the number is prime.
    return  true;
};


// Process the input lines to count prime numbers.
const   ans =   line
                // Skip the first line (assuming it's a count or header, based on typical competitive programming input).
                .slice(1)
                // Convert each remaining line (string) to an integer.
                .map(   x   =>  parseInt(x) )
                // Reduce the array of numbers to a single count of prime numbers.
                .reduce(    (acc, x)    =>  isPrime(x)
                                            ?   acc + 1 // If x is prime, increment the accumulator.
                                            :   acc     // Otherwise, keep the accumulator as is.
                            ,   0   ); // Initialize the accumulator to 0.


// Print the final calculated answer to the console.
console.log(ans);