/*
 * This JavaScript file processes two integer inputs, 'k' and 'x',
 * to generate and print a sequence of numbers.
 *
 * The sequence consists of 'k' numbers centered around 'x',
 * specifically: (x - (k-1)), ..., (x - 1), x, (x + 1), ..., (x + (k-1)).
 *
 * The program expects input from standard input in the format "k x".
 * For example, if k=3 and x=5, the output would be "4 5 6".
 */

// The primary function responsible for executing the program's logic.
function main(
  input // This parameter receives the raw string read from standard input.
) {
  // Step 1: Parse the input string into individual arguments.
  // The input is expected to be space-separated.
  const args = input.split(' ');

  // Step 2: Extract and convert the first argument to an integer.
  // This value, 'k', determines the total number of elements in the sequence.
  const k = parseInt(
    args[0], // The first element from the split array.
    10     // Specify radix 10 for decimal conversion.
  );

  // Step 3: Extract and convert the second argument to an integer.
  // This value, 'x', is the central number around which the sequence is built.
  const x = parseInt(
    args[1], // The second element from the split array.
    10     // Again, radix 10 for decimal conversion.
  );


  // Step 4: Calculate 'n', which represents the count of numbers
  // on either side of 'x' in the sequence.
  // If k is the total count, then (k-1) numbers are distributed around x.
  const n = k - 1;


  // Step 5: Initialize an empty string variable.
  // This variable will accumulate the generated sequence of numbers.
  var ans = ""; // The final string to be outputted.


  // Step 6: Generate the numbers smaller than 'x'.
  // Loop from 'n' down to 1 to find (x - i) values.
  for (
    var i = n; // Loop counter 'i' starts from 'n'.
    i > 0;     // Continue as long as 'i' is greater than zero.
    i--        // Decrement 'i' by 1 in each iteration.
  ) {
    // Append the calculated value (x - i) followed by a space.
    ans += (x - i) + " ";
  }

  // Step 7: Add the central number 'x' to the sequence.
  // This number is added without a preceding space if it's the first element,
  // or after the last element from the previous loop.
  ans += x;


  // Step 8: Generate the numbers larger than 'x'.
  // Loop from 1 up to 'n' to find (x + i) values.
  for (
    var i = 1; // Loop counter 'i' starts from 1.
    i <= n;    // Continue as long as 'i' is less than or equal to 'n'.
    i++        // Increment 'i' by 1 in each iteration.
  ) {
    // Append a space before the calculated value (x + i).
    ans += " " + (x + i);
  }

  // Step 9: Print the final constructed sequence string to the console.
  console.log(ans)
}

// This is the entry point for the script when run in a Node.js environment.
// It reads the entire content of standard input (typically '/dev/stdin' on Linux/macOS)
// as a UTF-8 encoded string and passes it to the 'main' function.
main(
  require('fs') // Access the Node.js 'file system' module.
    .readFileSync( // Use the synchronous file reading function.
      '/dev/stdin', // Path to the standard input stream.
      'utf8'        // Specify UTF-8 encoding for the input.
    )
);