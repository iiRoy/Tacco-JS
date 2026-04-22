// This section handles standard input operations.
// It uses Node.js 'fs' module to read from stdin.
var fs = require('fs')
  , length = fs.fstatSync(process.stdin.fd).size // Determine the size of the input stream.
  , buffer = new Buffer(length)                    // Allocate a buffer to hold the input.
  , bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0) // Read data into the buffer.
  , input = buffer.toString('hex', 0, bytesRead)   // Convert buffer to hexadecimal string.
             .split('0a');                          // Split the input by newline character (hex '0a').
// Question: Is reading in hex format faster?
                                                // Call the main processing function.
main();


/**
 * The primary function that orchestrates the decryption process.
 * It attempts to decrypt an input string using an affine cipher.
 */
function main()
{
    // These are values coprime to 26, used as 'alpha' in the affine cipher.
    var multiply = new Int8Array([1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25]);
    var lenj     = multiply.length; // Store the length for loop optimization.

    // This array will store the ASCII values of the alphabet after transformation.
    var alphabets = new Int8Array(26);

    // This table will map transformed ASCII codes back to original (a-z) ASCII codes.
    var convertTable = new Int8Array(123);

    // Initialize the conversion table with a direct mapping (identity).
    for (var init = 123; init--;) {
        convertTable[init] = init;
    }


    // Outer loop: Iterate through each line of input, excluding the first (header) and last (empty).
    FIRST:
    for (var i = 1, leni = input.length - 1; i < leni; i++)
    {
        var inp    = input[i]; // Current input line (hex string).
        var c      = inp.split('20'); // Split the line by spaces (hex '20') to get words.
        var clen   = c.length; // Number of words in the current line.

        // Loop through all possible 'alpha' values (coprime to 26).
        for (var j = 0; j < lenj; j++)
        {
            var alpha = multiply[j]; // Current alpha value.

            // Loop through all possible 'beta' values (0-25).
            for (var beta = 26; beta--;)
            {
                // Inner loop: Create the transformation table for a-z based on current alpha and beta.
                for (var conv = 26; conv--;) // Iterates 25 down to 0.
                {
                    // Affine cipher formula: (ax + b) mod m. Here m=26, x is 0-25.
                    // Add 97 to convert back to lowercase ASCII ('a' is 97).
                    alphabets[conv] = (conv * alpha + beta) % 26 + 97;
                }

                // Get the hexadecimal ASCII representation of "that" and "this"
                // after applying the current affine transformation.
                // 't' (19), 'h' (7), 'a' (0), 's' (18), 'i' (8)
                var thatIs = alphabets[19].toString(16) + alphabets[7].toString(16) + alphabets[0].toString(16) + alphabets[19].toString(16);
                var thisIs = alphabets[19].toString(16) + alphabets[7].toString(16) + alphabets[8].toString(16) + alphabets[18].toString(16);

                var found = false; // Flag to check if "that" or "this" is found.

                // Check if either "that" or "this" (in their transformed hex form) exists in the current line.
                for (var d = clen; d--;)
                {
                    var cd = c[d]; // Current word (hex string).
                    if (cd == thatIs || cd == thisIs)
                    {
                        found = true; // Set flag if a match is found.
                        break;        // Exit inner loop as we found a keyword.
                    }
                }

                // If "that" or "this" was found, we assume this is the correct alpha/beta pair.
                if (found)
                {
                    // Re-populate the convertTable for decryption.
                    // It maps the *transformed* ASCII code back to the *original* ASCII code.
                    for (var conv = 26; conv--;)
                    {
                        var fromCode        = alphabets[conv]; // The transformed ASCII code.
                        convertTable[fromCode] = conv + 97;      // Maps back to original 'a'-'z' ASCII.
                    }

                    var result = ""; // Initialize an empty string for the decrypted result.

                    // Decrypt the input line character by character.
                    // Each character is represented by two hex digits.
                    for (var k = 0; k < inp.length; k += 2)
                    {
                        // Take two hex digits, parse them as an integer (base 16).
                        // Use this integer as an index into convertTable to get the original ASCII code.
                        // Convert the ASCII code back to a character and append to result.
                        result += String.fromCharCode(convertTable[parseInt(inp[k] + inp[k + 1], 16)]);
                    }

                    console.log(result); // Output the decrypted line.
                    continue FIRST;      // Move to the next input line (skip remaining alpha/beta combinations).
                }
            }
        }
    }
}