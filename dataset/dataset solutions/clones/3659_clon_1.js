/*
 * This JavaScript code defines a function to check for prime numbers
 * and then processes an array of numbers to find a specific maximum value.
 *
 * The problem statement typically involves reading input from standard input,
 * identifying prime numbers, and then performing a calculation based on them.
 */

// Function definition for checking if a number is prime.
function   primeNumber   (   num   )
{
    // A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself.
    // The number 2 is the smallest prime number and the only even prime number.
    if   (   num   ===   2   )
    {
        return    true; // 2 is a prime number.
    }   else   {
        // For numbers greater than 2, we need to check for divisibility.
        // We iterate from 2 up to (but not including) the number itself.
        for   (   i   =   2;   i   <   num;   i++   )
        {
            // If 'num' is perfectly divisible by 'i' (remainder is 0), then it's not a prime number.
            if   (   num   %   i   ===   0   )
            {
                return    false; // Not prime.
                // The 'break' statement here is technically redundant as 'return false' already exits the function.
                break;
            }
            // If 'i + 1' becomes equal to 'num', it means the loop has completed
            // all checks up to 'num - 1' without finding any divisors.
            // Therefore, 'num' must be prime.
            if   (   i   +   1   ===   num   )
            {
                return    true; // Prime.
            }
        }
    }
} // End of the primeNumber function.


// Read input from standard input.
// The 'fs' module is used for file system operations, and '/dev/stdin' is a common path for standard input.
// The input is read as a UTF-8 string and then split by newline characters.
var   input   =   require('fs').readFileSync(   '/dev/stdin',   'utf8'   ).split(   "\n"   );

// Assuming the actual numbers to be processed are on the second line of the input.
// The second line (index 1) is taken and split by spaces to get individual number strings.
input   =   input[1].split(   " "   );

// Initialize an empty array to store the prime numbers found in the input.
var   arr   =   [];

// Iterate over each element 'e' obtained from the split input array.
input.forEach((   e   )   =>   {
  // Convert the string element 'e' to a number using Number() and then check if it's prime.
  if   (   primeNumber(   Number(e)   )   )
  {
    // If the number is prime, add it to the 'arr' array.
    arr.push(   Number(e)   );
  }
});


// Initialize 'max' to 0. This variable will keep track of the maximum 'current' sum found.
var   max   =   0;

// This is an infinite loop (or until a 'break' statement is encountered).
// The loop variable 'i' starts from 1 and increments in each iteration.
for   (   var   i   =   1;   ;   i++   )
{
  // Initialize 'current' to 0 for each new iteration of the outer loop.
  // This variable will accumulate the sum of remainders.
  var   current   =   0;

  // Iterate over each prime number 'e' stored in the 'arr' array.
  arr.forEach((   e   )   =>   {
    // Calculate the remainder of 'i' divided by 'e' and add it to 'current'.
    current   +=   i   %   e;
  });

  // If the 'current' sum of remainders is 0, it means 'i' is perfectly divisible by every
  // prime number in 'arr'. This condition signals the termination of the loop for this problem.
  if   (   current   ===   0   )
  {
    break; // Exit the for loop.
  }

  // If the current sum ('current') is greater than the previously recorded maximum ('max'),
  // update 'max' with the new 'current' value.
  if   (   max   <   current   )
  {
    max   =   current;
  }
}

// Finally, print the maximum value found to the console (standard output).
console.log(   max   );