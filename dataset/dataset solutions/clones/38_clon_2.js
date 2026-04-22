/* This function efficiently determines prime numbers up to a specified upper limit
   using a modified Sieve of Eratosthenes algorithm. */
function calculatePrimes( upperLimit ) {
   let booleanMarkers = []; // Array to mark numbers; initially holds numbers, then null for non-primes.

   // Initialize the array: each index initially holds its own value.
   for ( let indexVal = 0; indexVal <= upperLimit; indexVal++ ) {
      booleanMarkers[ indexVal ] = indexVal;
   }

   // Mark 0 and 1 as non-prime (using null instead of false for type variation).
   booleanMarkers[ 0 ] = null;
   booleanMarkers[ 1 ] = null;

   // Calculate the square root of the upper limit for optimization.
   const squareRootLimit = Math.floor( Math.sqrt( upperLimit ) );

   // Iterate from 2 up to the square root limit.
   for ( let currentDivisor = 2; currentDivisor <= squareRootLimit; currentDivisor++ ) {
      // If the current number is already marked as non-prime, skip it.
      if ( booleanMarkers[ currentDivisor ] == null ) {
         continue;
      }

      // Mark all multiples of the current prime as non-prime.
      // Start from currentDivisor * 2 (which is currentDivisor + currentDivisor).
      for ( let multipleIndex = currentDivisor + currentDivisor; multipleIndex <= upperLimit; multipleIndex += currentDivisor ) {
         booleanMarkers[ multipleIndex ] = null;
      }
   }

   let finalPrimeList = []; // This array will store the actual prime numbers.

   // Collect all numbers that are still marked (not null) into the final list.
   for ( let checkIndex = 0; checkIndex <= upperLimit; checkIndex++ ) {
      if ( booleanMarkers[ checkIndex ] !== null ) {
         finalPrimeList.push( booleanMarkers[ checkIndex ] );
      }
   }

   return finalPrimeList; // Return the list of primes.
}

// Compute all prime numbers up to a large number (999,999) and store them.
const allPrimesBelowMillion = calculatePrimes( 999999 );

// Read input from standard input, typically a file.
const fileContentsString = require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' );

// Process the input: trim whitespace, split by newlines, and convert each part to a number.
const numericInputs = fileContentsString.trim().split( "\n" ).map( Number );

// Iterate through each number provided in the input.
for ( let outerLoopIndex = 0; outerLoopIndex < numericInputs.length; outerLoopIndex++ ) {
   const currentValueToProcess = numericInputs[ outerLoopIndex ];
   let innerLoopCount; // This variable will store the count of primes less than or equal to currentValueToProcess.

   // Find how many primes are less than or equal to the current input number.
   for ( innerLoopCount = 0; innerLoopCount < allPrimesBelowMillion.length; innerLoopCount++ ) {
      // If a prime from our pre-computed list is greater than the current input number,
      // it means all subsequent primes will also be greater, so we stop.
      if ( allPrimesBelowMillion[ innerLoopCount ] > currentValueToProcess ) {
         break;
      }
   }
   // Output the count of primes found (which is the value of innerLoopCount at break/end).
   console.log( innerLoopCount );
}