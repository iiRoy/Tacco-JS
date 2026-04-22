/*
 * This is a JavaScript file.
 * It strictly enforces modern JavaScript syntax and rules.
 */
"use strict";

// Import the 'fs' module for file system operations.
// Read the entire content of '/dev/stdin' as UTF-8.
var input = require("fs") .readFileSync( "/dev/stdin", "utf8" ) ;

// Initialize input processing variables.
// 'cin' will hold an array of input values, split by space or newline.
// 'cid' is an index for 'cin', initialized to 0.
var cin = input .trim() .split( / |\n/ ) , cid = 0 ;


// The main execution point of the script.
// Calls the 'main' function and prints its result to the console.
console.log( main().toString() ) ;


/**
 * Main function to solve the problem.
 * It calculates the number of factors for a given number 'n'
 * based on a specific decomposition logic.
 * @returns {number} The final calculated answer.
 */
function main() {

    // Retrieve the first number from the input and convert it to a number.
    var n = +cin.shift() ;

    // Generate a list of prime numbers up to the square root of 'n'.
    // This is used for efficient prime factorization.
    var primes = make_primes( Math.sqrt( n ) ) ;


    // Handle base cases for 'n'.
    if ( n == 1 ) return 0 ;
    if ( n == 2 ) return 1 ;

    // Initialize the answer variable.
    let ans = 0 ;

    // Initialize 'p' for prime factorization, starting with the first prime.
    let p = 2 ;

    // Loop through the primes to factorize 'n'.
    // The loop continues as long as 'p' is less than 'n'.
    for ( let k = 0 ; p < n ; k ++ ) {

        // Get the current prime from the pre-calculated list.
        p = primes[ k ] ;

        // The following lines are commented out in the original code.
        // They seem to be related to extending the prime list dynamically,
        // but are not active in this version.
        //        while (primes[primes.length - 1] < n) {
        //           primes.push(next_prime(primes, n));
        //      }
        // console.log({p, primes}); // Debugging line, also commented out.


        // Initialize exponent 'e' for the current prime 'p'.
        let e = 0 ;

        // Count how many times 'p' divides 'n'.
        while ( n % p == 0 ) {
            e ++ ;        // Increment the exponent.
            n = n / p ;   // Divide 'n' by 'p'.
        }

        // If 'p' was not a factor of 'n', skip to the next prime.
        if ( e == 0 ) continue ;

        /*
         * This section calculates a value based on the exponent 'e'.
         * The original comments suggest a pattern like:
         * x=9 (e=2 for 3^2) -> 1+2+3+4, it means 3 times, < 2^4
         * x=10 (e=1 for 2^1, e=1 for 5^1) -> 1+2+3+4, it means 4 times
         * This logic seems to be finding the largest 'i' such that 1 + 2 + ... + (i+1) <= e.
         */
        let i = 1 ;
        let sum = 1 ; // Represents the sum of 1 to i, or similar.

        while ( sum + i + 1 <= e ) {
            // console.log(sum, i, e); // Debugging line.
            sum = sum + i + 1 ;
            i ++ ;
        }

        // Add the calculated 'i' to the total answer.
        ans = ans + i ;
    }

    // If 'n' still has a value greater than 1 after prime factorization,
    // it means 'n' itself is a prime factor (or a product of large primes not in 'primes').
    // In this specific problem context, it implies a remaining prime factor.
    if ( n > 1 ) ans ++ ;

    // Return the final computed answer.
    return ans ;
}


/**
 * Generates a list of prime numbers up to a specified maximum value.
 * Uses a basic trial division method.
 * @param {number} max The upper limit for prime generation.
 * @returns {Array<number>} An array containing prime numbers.
 */
function make_primes( max ) {

    // Initialize with the first two prime numbers.
    let primes = [ 2 , 3 ] ;

    // Flag to check for primality.
    let flg ;

    // Iterate through odd numbers starting from 5 up to 'max'.
    for ( let x = 5 ; x <= max ; x += 2 ) {

        flg = 0 ; // Assume 'x' is prime initially.

        // Check divisibility by existing primes up to sqrt(x).
        for ( let j = 0 ; primes[ j ] * primes[ j ] <= x ; j ++ ) {

            // If 'x' is divisible by primes[j], it's not prime.
            if ( x % primes[ j ] == 0 ) {
                flg = 1 ; // Set flag to indicate not prime.
                break ;   // No need to check further divisors.
            }
        }

        // If 'flg' is still 0, 'x' is prime, so add it to the list.
        if ( flg == 0 ) {
            primes.push( x ) ;
        }
    }

    // Return the generated list of primes.
    return primes ;
}


/**
 * (This function is not used in the provided main logic but is present in the original code.)
 * Finds the next prime number greater than the last prime in the 'primes' array,
 * up to a specified maximum.
 * It also pushes the found prime into the 'primes' array.
 * @param {Array<number>} primes An array of existing prime numbers.
 * @param {number} max The upper limit for searching the next prime.
 * @returns {number | Array<number>} The found prime number, or the original primes array if no new prime is found up to 'max'.
 */
function next_prime( primes , max ) {

    let flg ; // Flag for primality check.

    // Start checking from 2 greater than the last prime in the list (to ensure odd numbers).
    for ( let x = primes[ primes.length - 1 ] + 2 ; x <= max ; x += 2 ) {

        flg = 0 ; // Assume 'x' is prime.

        // Check divisibility by existing primes up to sqrt(x).
        for ( let j = 0 ; primes[ j ] * primes[ j ] <= x ; j ++ ) {

            if ( x % primes[ j ] == 0 ) {
                flg = 1 ; // 'x' is not prime.
                break ;
            }
        }

        // If 'flg' is 0, 'x' is the next prime. Add it and return.
        if ( flg == 0 ) {
            primes.push( x ) ;
            return x ;
        }
    }

    // If no new prime is found up to 'max', return the original primes array (behavior in original code).
    return primes ;
}