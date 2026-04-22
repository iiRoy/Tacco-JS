/*
 * This module provides functionality to compute prime numbers
 * up to a specified upper bound using the Sieve of Eratosthenes algorithm.
 */
function calcPrimes ( upperBound ) {
    // Initialize an array where each index represents a number,
    // initially marking all numbers as potentially prime.
    var candidateFlags = [];
    for ( var currentNum = 0 ; currentNum <= upperBound ; currentNum ++ ) {
        candidateFlags[ currentNum ] = currentNum;
    }

    // Mark 0 and 1 as non-prime explicitly, as they are not considered prime numbers.
    candidateFlags[ 0 ] = false;
    candidateFlags[ 1 ] = false;

    // Calculate the square root of the upper bound,
    // which is the limit for the outer loop in the sieve process.
    var sqrtBound = Math.floor( Math.sqrt( upperBound ) );

    // Iterate from 2 up to the square root limit.
    // For each number that is still marked as prime,
    // mark its multiples as non-prime.
    for ( var currentNum = 2 ; currentNum <= sqrtBound ; currentNum ++ ) {
        // If the current number is already marked as non-prime,
        // it means it's a multiple of a smaller prime, so skip it.
        if ( candidateFlags[ currentNum ] === false ) {
            continue;
        }

        // Mark all multiples of the current prime number as non-prime.
        // Start marking from `currentNum * currentNum` (or `currentNum + currentNum` as an optimization here)
        // because smaller multiples would have already been marked by smaller prime factors.
        for ( var multipleVal = currentNum + currentNum ; multipleVal <= upperBound ; multipleVal += currentNum ) {
            candidateFlags[ multipleVal ] = false;
        }
    }

    // After the sieve process, collect all numbers that remain marked as prime
    // into a new list for the final result.
    var primeCollection = [];
    for ( var currentNum = 0 ; currentNum <= upperBound ; currentNum ++ ) {
        if ( candidateFlags[ currentNum ] !== false ) {
            primeCollection.push( candidateFlags[ currentNum ] );
        }
    }
    // Return the final collection of prime numbers found within the given range.
    return primeCollection;
}

// Generate a comprehensive list of prime numbers up to a specified large value.
var generatedPrimesList = calcPrimes( 999999 );

// Load input data from standard input stream.
// This typically involves reading contents from a file or console.
var rawInputContent = require( 'fs' ) .readFileSync( '/dev/stdin', 'utf8' );

// Process the raw input content:
// 1. Remove leading/trailing whitespace.
// 2. Split the string into an array of strings based on newline characters.
// 3. Convert each string element into a numeric value.
var queryNumbersArray = ( rawInputContent.trim() ) .split( "\n" ) .map( Number );

// Iterate through each numeric query provided in the input array.
for ( var queryIndex = 0 ; queryIndex < queryNumbersArray.length ; queryIndex ++ ) {
    var targetNumber = queryNumbersArray[ queryIndex ];
    // For each target number, search within the pre-generated list of primes
    // to find its immediate prime neighbors.
    for ( var primeIndex = 0 ; primeIndex < generatedPrimesList.length ; primeIndex ++ ) {
        // If the target number is exactly one of the primes in our list,
        // print the prime immediately preceding it and the prime immediately succeeding it.
        if ( generatedPrimesList[ primeIndex ] === targetNumber ) {
            console.log( generatedPrimesList[ primeIndex - 1 ] + " " + generatedPrimesList[ primeIndex + 1 ] );
            break; // Exit the inner loop as the neighbors have been found for the current target.
        }
        // If the current prime in the list is greater than the target number,
        // it means the target number lies between the previous prime and the current prime.
        // Print the prime immediately preceding the target number and the current prime itself.
        if ( generatedPrimesList[ primeIndex ] > targetNumber ) {
            console.log( generatedPrimesList[ primeIndex - 1 ] + " " + generatedPrimesList[ primeIndex ] );
            break; // Exit the inner loop as the bounding primes have been found.
        }
    }
}