/*
 * This file processes numerical input, converting it from a base-10 representation
 * to a modified octal string based on specific transformation rules.
 * It reads from standard input and writes the result to standard output.
 *
 * The 'solve' function is currently a placeholder and not used in the main logic.
 */


  // Import the Node.js 'fs' (file system) module for I/O operations.
  var fs = require('fs')
    ,
    // Determine the exact size of the standard input stream in bytes.
    length = fs.fstatSync(process.stdin.fd).size
    ,
    // Create a new Buffer object to hold the raw bytes read from stdin.
    buffer = new Buffer(length)
    ,
    // Synchronously read data from stdin into the buffer.
    // Parameters: fd (file descriptor), buffer, offset, length, position.
    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0)
    ,
    // Convert the buffer content to a UTF-8 string, then split it by newline characters
    // to obtain an array where each element is a line of input.
    input = buffer.toString('utf8', 0, bytesRead).split('\n')
  ; // End of initial variable declarations block.


// This function is defined but currently has no implementation.
// It takes a single argument 'n' but does nothing with it.
function solve(n)
{
    // Function body is intentionally left empty.
}


// The primary function that orchestrates the input processing and output generation.
function main()
{
  // Continue looping as long as the first element in the 'input' array is not the string '0'.
  // '0' is typically used as a sentinel value to indicate the end of input.
  while ( input[0] !== '0' )
  {
    // Output the result of the complex transformation pipeline to the console.
    console.log(
        (
            // Retrieve and remove the first element from the 'input' array,
            // then convert it to a number (the '- 0' forces numeric conversion).
            input.shift() - 0
        )
        // Convert the resulting number into its string representation in base 8 (octal).
        .toString(8)
        // Split the octal string into an array of individual character digits.
        .split('')
        // Iterate over each character (digit) and apply a transformation rule.
        .map(
            function (ch)
            {
                // Rule 1: If the digit is '4', increment its numeric value by 1.
                if ( ch === '4' )
                {
                    return +ch + 1;
                }

                // Rule 2: If the digit's numeric value is 5 or greater, increment it by 2.
                // '+ch' or 'ch - 0' converts the character digit to a number.
                if ( ch - 0 >= 5 )
                {
                    return +ch + 2;
                }

                // Default Rule: If neither of the above rules apply, return the digit's numeric value unchanged.
                return +ch ;
            }
        )
        // Join all the transformed numeric digits back into a single string.
        .join('')
    ); // Concludes the console.log statement.
  } // Ends the 'while' loop.
} // Ends the 'main' function definition.

// Invoke the 'main' function to begin program execution.
main();
// End of file.