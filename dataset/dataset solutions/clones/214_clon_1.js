/*
 * This JavaScript code implements a solution for a problem that involves
 * finding prime numbers and then performing calculations based on them.
 * It uses a Sieve of Eratosthenes algorithm to generate primes up to a maximum value.
 */

// Define a function named 'prime' that takes one argument: 'max'.
function prime(   max   )
{
   // Declare a variable 'arr' and initialize it as an empty array.
   var   arr = [];

   // Initialize the array 'arr' with numbers from 0 to 'max'.
   // This loop runs from i = 0 up to and including max.
   for (   var   i = 0;   i <= max;   i++   )
      arr[i] = i;

   // Mark 0 and 1 as not prime, as per mathematical definition.
   arr[0] = false;
   arr[1] = false;

   // Calculate the square root of 'max' and floor it.
   // This is an optimization for the Sieve algorithm.
   var   sqrt = Math.floor(   Math.sqrt(   max   )   );

   // The main loop for the Sieve of Eratosthenes.
   // It iterates from 2 up to the calculated square root.
   for(   var   i = 2;   i <= sqrt;   i++   )
   {
      // If arr[i] is already marked as false (not prime), skip to the next iteration.
      if (   arr[i] == false   )
         continue;

      // If arr[i] is prime, mark all its multiples as not prime.
      // Start from i*i (or i+i for the first multiple after i itself) up to 'max'.
      // j increments by i in each step.
      for (   var   j = i + i;   j <= max;   j += i   )
      {
         arr[j] = false;
      }
   }

   // After the sieve, collect all the numbers that are still marked as prime (not false).
   var   result = [];

   // Iterate through the array 'arr' from 0 to 'max'.
   for (   var   i = 0;   i <= max;   i++   )
   {
      // If arr[i] is not false, it means it's a prime number.
      if (   arr[i] !== false   )
      {
         result.push(   arr[i]   ); // Add the prime number to the 'result' array.
      }
   }

   // Return the array containing all prime numbers up to 'max'.
   return   result;
}


// Generate an array 'p' containing prime numbers up to 999,999.
var   p = prime(   999999   );


// Read input from standard input (/dev/stdin) as a UTF-8 string.
var   input = require('fs').readFileSync(   '/dev/stdin',   'utf8'   );


// Process the input:
// 1. Trim whitespace from the start and end of the input string.
// 2. Split the trimmed string by newline characters into an array of strings.
// 3. Map each string in the array to its Number representation.
var   Arr = (   input.trim()   ).split(   "\n"   ).map(   Number   );


// Iterate through the 'Arr' array to process each input number.
for (   var   i = 0;   i < Arr.length;   i++   )
{
   // Get the current number from the input array.
   var   a = Arr[i];

   // If the current number 'a' is 0, terminate the loop.
   // This acts as a sentinel value.
   if (   a == 0   )
      break;

   // Initialize a variable 'sum' to store the sum of primes.
   var   sum = 0;

   // Sum the first 'a' prime numbers from the pre-computed 'p' array.
   // The loop runs from j = 0 up to (but not including) 'a'.
   for (   var   j = 0;   j < a;   j++   )
   {
      sum += p[j]; // Add the j-th prime number to 'sum'.
   }

   // Print the calculated sum to the console.
   console.log(   sum   );
}