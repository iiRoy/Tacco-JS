/* This script processes input to find common divisors and then
 * outputs a specific one based on the third input parameter.
 * It's designed to read from standard input.
 */

// Define the main function that processes the input string.
function Main(  input  )
{
  // Parse the input string: split by space, then convert each part to a number.
  // 'i' will store an array of numbers from the input.
  i   =   input .  split  (  " "  ) .  map  (  Number  )  ;


  // Initialize an empty array 'r' to store the common divisors found.
  r   =   [  ]  ;


  // Loop through potential divisors 'a'.
  // The loop starts from 1.
  // It goes up to one less than the minimum of the first two input numbers.
  for  (
    a   =   1  ;
    a   <   Math .  min  (  i  [  0  ]  ,  i  [  1  ]  )   -   1  ;
    a++
  )
  {
    // Check if 'a' is a common divisor of the first two numbers (i[0] and i[1]).
    // A number 'x' is a divisor of 'y' if y % x === 0.
    if  (  (  i  [  0  ]   %   a   ===   0  )   &&   (  i  [  1  ]   %   a   ===   0  )  )
    {
      // If 'a' is a common divisor, add it to the 'r' array.
      r .  push  (  a  )  ;
    }
  }

  // Output the result to the console.
  // The result is an element from the 'r' array.
  // The index is calculated by subtracting the third input number (i[2])
  // from the total number of common divisors found (r.length).
  console .  log  (  r  [  r .  length   -   i  [  2  ]  ]  )  ;
}


// Call the Main function.
// Read input from standard input using Node.js 'fs' module.
// The input is read as UTF-8 encoded string.
Main  (
  require  (  "fs"  ) .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )
)  ;