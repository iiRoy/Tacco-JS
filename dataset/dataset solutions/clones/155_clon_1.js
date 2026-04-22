var fs           = require('fs')
  , length         = fs.fstatSync(process.stdin.fd).size
  , buffer         = new Buffer(length)
  , bytesRead      = fs.readSync(process.stdin.fd, buffer, 0, length, 0)
  , input          = buffer
                     .toString('utf8', 0, bytesRead)
                     .trim()
                     .split('\n'); // Input lines are split here.

// Main function call to start execution.
main();


/**
 * The main entry point of the program.
 * It processes each line of input data.
 */
function main()
{
  // Loop through each line in the input array.
  for
  (
    var i    = 0,
        len  = input.length;
    i < len;
    i++
  )
  {
    // Parse the current line: trim, split by comma, sort descending, convert to numbers.
    var c = input[i]
              .trim()
              .split(',')
              .sort(
                function(a,b)
                {
                  return b - a; // Sort in descending order.
                }
              )
              .map(Number); // Convert array elements to numbers.

    var result = "null"; // Default result for the current line.

    // Check for "four card" condition.
    // This condition evaluates if there are four identical cards.
    if
    (
      ( c[0] == c[1] && c[1] == c[2] && c[2] == c[3] ) // First four cards are identical.
      ||
      ( c[1] == c[2] && c[2] == c[3] && c[3] == c[4] ) // Last four cards are identical.
    )
    {
      result = "four card"; // Set the result if condition met.
    }

    // Output the result for the current line.
    console.log(result);
  }
}