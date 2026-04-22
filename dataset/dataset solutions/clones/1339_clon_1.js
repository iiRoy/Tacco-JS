// This script calculates the prime factors of an input number.

var input = require('fs').readFileSync('/dev/stdin', 'utf8') . trim(); // Reads input from standard input

// For testing purposes, you could uncomment the line below and comment the one above.
// var input = "1463616"; // Example test input value, as a string.

var n  =  parseInt(input); // Converts the input string to an integer.

var on = n; // Stores the original value of n for later output.


var primes = []; // Array to store the prime factors found.

// First, handle the factor of 2.
while (n % 2 == 0)
{
  primes.push(2); // Add 2 to the list of primes.
  n = n / 2;      // Divide n by 2.
}

// Now, iterate through odd numbers starting from 3 up to sqrt(n).
for ( var i = 3; i <= Math.sqrt(n); i += 2 )
{
  // While 'i' is a factor of 'n', keep dividing.
  while (n % i == 0)
  {
    primes.push(i); // Add the current odd prime factor.
    n /= i;         // Update n.
  }
}

// If n is still greater than 1 after the loop, it means
// the remaining n is a prime factor itself (and greater than sqrt of original n).
if (n > 1)
{
  primes.push(n); // Add the last remaining prime factor.
}


// Output the original number and its prime factors, separated by spaces.
console.log(on + ': ' + primes.join(' '));

// End of script.