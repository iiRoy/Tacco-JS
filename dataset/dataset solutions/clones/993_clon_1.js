// This array will hold all the lines read from standard input.
lines = [];


/*
 *  Initialize the readline interface.
 *  This module provides an interface for reading data from a Readable stream
 *  (like process.stdin) one line at a time.
 */
var reader = require( 'readline' ).createInterface(
  {
    // Set the input stream to standard input (keyboard).
    input :  process.stdin,

    // Set the output stream to standard output (console).
    output:  process.stdout
  }
);


// Attach an event listener for each 'line' event.
// This callback function executes every time a new line of input is received.
reader.on(
  'line',
  ( line ) =>
  {
    // Add the received line to our 'lines' array.
    lines.push( line );
  }
);


/*
 *  Attach an event listener for the 'close' event.
 *  This callback function executes when the input stream ends (e.g., Ctrl+D or EOF).
 *  All processing of the input data will happen within this block.
 */
reader.on(
  'close',
  () =>
  {
    // The first line of input is expected to be the count of numbers to check (N).
    const N = parseInt( lines[ 0 ] );

    // Remove the first line from the array, as it has been processed.
    lines.shift();


    // Initialize a counter for prime numbers found.
    var cnt = 0;

    // Loop through the remaining N lines, each representing a number to test.
    for (
      var n = 0;         // Initialize loop counter.
      n < N;             // Loop condition: continue as long as 'n' is less than N.
      n++                // Increment 'n' after each iteration.
    )
    {
      // Parse the current line into an integer.
      var number = parseInt( lines[ n ] );

      // Check if the current number is prime using the 'isPrime' helper function.
      if ( isPrime( number ) )
      {
        // If it is indeed a prime number, increment our counter.
        cnt++;
      }
    }

    // After processing all numbers, print the total count of prime numbers found.
    console.log( cnt );
  }
);


/**
 *  isPrime
 *  -------
 *  Determines whether a given integer is a prime number.
 *  A prime number is a natural number greater than 1 that has no positive divisors
 *  other than 1 and itself.
 *
 *  @param {number} number The integer to be evaluated for primality.
 *  @returns {boolean} True if the number is prime, false otherwise.
 */
function isPrime( number )
{
    // By default, assume the number is prime until proven otherwise.
    var result = true;

    // Special case: The number 2 is the only even prime number.
    if ( number === 2 )
    {
        return true;
    }

    // Numbers less than 2 are not prime.
    // Any even number greater than 2 is also not prime (divisible by 2).
    if ( number < 2 || number % 2 === 0 )
    {
        return false;
    }

    // Calculate the square root of the number.
    // We only need to check for divisors up to the square root of the number
    // to determine primality efficiently.
    var rootedNum = Math.sqrt( number );  // 平方根を求める

    // Iterate through odd numbers starting from 3 up to the calculated square root.
    // We can skip even numbers because we already handled them.
    for (
      var i = 3;           // Start checking divisibility from 3.
      i <= rootedNum;      // Continue as long as 'i' is less than or equal to the square root.
      i += 2               // Increment 'i' by 2 to check only odd divisors.
    )
    {
      // If the number is perfectly divisible by 'i', it means it has a factor
      // other than 1 and itself, so it's not prime.
      if ( number % i === 0 )
      {
        return false;
      }
    }

    // If the loop completes without finding any divisors, the number is prime.
    return result;
}