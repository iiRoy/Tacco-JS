/*
 This script processes standard input to solve a problem.
 It uses Node.js 'fs' module for synchronous file operations
 to read all available input from stdin.
 */
var fs = require('fs')
  , length = fs.fstatSync(process.stdin.fd).size
  , buffer = new Buffer(length)
  , bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0)
  , input = buffer.toString('utf8', 0, bytesRead).split('\n')
  ; // End of input variable declarations.

main(); // Initiate the main execution flow of the program.

/*
  The primary function containing the core logic of the application.
  It reads multiple test cases, each starting with the number of lines
  that follow for that specific case.
*/
function main()
{
  // Convert the array of string inputs into an array of 32-bit integers.
  var intInput = new Int32Array(input);

  // Initialize a pointer to keep track of the current line being read from intInput.
  var readLine = 0;

  while(true)
  {
    // Read the first number of the current test case, which indicates how many subsequent lines to process.
    // The '- 0' operation ensures the value is treated as a number, though it's already an integer.
    var maxLines = intInput[readLine] - 0;

    // If maxLines is 0 (or falsy), it signifies the end of input or test cases.
    if ( ! maxLines )
    {
      break; // Exit the loop when no more test cases are present.
    }

    // Initialize variables for Kadane's algorithm to find the maximum subarray sum.
    var dp = -1000000;   // 'dp' stores the maximum sum ending at the current position.
    var result = -1000000; // 'result' stores the overall maximum sum found across all subarrays.

    // Loop through each number of the current test case.
    for ( var i = 0 ; i < maxLines ; i ++ )
    {
      // Increment readLine to get the next number for the current test case.
      var now = intInput[ ++ readLine ];

      // Update 'dp': The maximum sum ending at 'now' is either 'now' itself (starting a new subarray)
      // or 'now' added to the previous maximum sum (extending the subarray).
      dp = max( dp + now, now );

      // Update 'result': The overall maximum sum is the larger of the current 'result' and the current 'dp'.
      result = max( result, dp );
    }

    // Output the maximum sum for the current test case.
    // NOTE: The original code has a potential bug here, using 'maxsum' instead of 'result'.
    // As per Type I cloning rules, identifiers must remain unchanged.
    console.log(maxsum);

    // After processing all lines for the current test case, advance readLine
    // to point to the line containing the 'maxLines' for the *next* test case.
    // This is necessary because the loop's '++readLine' already consumed the data lines.
    readLine++;
  }
}

/*
  A helper function to determine the maximum of two numbers without using a conditional branch.
  This is achieved through bitwise operations.
*/
function max( a, b )
{
  var t = a - b; // Calculate the difference between 'a' and 'b'.

  // If 't' is negative (a < b), 't >> 31' results in -1 (all bits set).
  // Then 't & (t >> 31)' will be 't'. 'a - t' becomes 'a - (a - b)' which is 'b'.
  // If 't' is non-negative (a >= b), 't >> 31' results in 0.
  // Then 't & (t >> 31)' will be 0. 'a - 0' is 'a'.
  return a - ( t & ( t >> 31 ) );
}