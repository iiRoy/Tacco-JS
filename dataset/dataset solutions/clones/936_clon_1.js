/*
 * This is a JavaScript utility script designed to process textual input.
 * It's structured to work both as a standalone script in environments like Node.js
 * (by reading from standard input) and potentially in other contexts,
 * assuming 'console.log' is available.
 *
 * The script defines functions for data parsing, filtering, and
 * a specific algorithm that appears to be related to string comparison
 * or sequence alignment, likely a dynamic programming approach.
 */

// Initialize a variable 'log' to reference the standard console logging function.
// This provides a consistent way to output information.
var log = console.log;

// Check if the 'process' object is defined, indicating a Node.js-like environment.
// This block handles input reading from standard input stream.
if (typeof process != "undefined")
{
        // Declare and initialize an empty string to accumulate all incoming data.
        var input = "";

        // Ensure the standard input stream is open and ready to receive data.
        process.stdin.resume();

        // Set the character encoding for the input stream to UTF-8.
        // This ensures correct interpretation of various characters.
        process.stdin.setEncoding('utf8');

        // Attach an event listener for 'data' events on the standard input.
        // Each time a chunk of data is received, it's appended to the 'input' string.
        process.stdin.on('data', function (chunk)
        {
                input += chunk; // Accumulate the data chunk.
        }); // End of 'data' event handler function.

        // Attach an event listener for 'end' events on the standard input.
        // This signifies that all input has been received.
        process.stdin.on('end', function ()
        {
                // Split the accumulated input string into an array of lines,
                // using the newline character as a delimiter.
                var lines = input.split("\n");

                // Invoke the primary processing function with the parsed lines.
                main(lines);
        }); // End of 'end' event handler function.

} // End of conditional block for Node.js-specific input handling.

/*
 * The 'main' function serves as the orchestrator for processing input lines.
 * It prepares the data and calls a specialized function for dataset processing.
 *
 * @param {string[]} lines - An array of strings, where each string is a line of input.
 */
function main(lines)
{
        // Remove the first element from the 'lines' array.
        // This is often done to discard a header line or a count.
        lines.shift();

        // Loop as long as there are lines remaining in the array to be processed.
        while (lines.length > 0)
        {
                // Extract the next two lines to form a 'dataset'.
                // This assumes datasets are always composed of two lines.
                var dataset = lines.slice(0, 2);

                // Transform each row in the 'dataset'.
                // The transformation involves filtering out non-lowercase alphabet characters.
                dataset = dataset.map(function (row)
                {
                        // Split the row string into an array of individual characters.
                        return row.split("").filter(function (e)
                        {
                                // Get the Unicode (or ASCII) code point of the character.
                                var code = e.charCodeAt(0);
                                // Return true if the character code falls within the lowercase English alphabet range.
                                return 97 <= code && code <= 122;
                        }).join(""); // Join the filtered characters back into a single string.
                }); // End of map function.

                // Pass the prepared dataset to the 'processDataset' function for core logic execution.
                processDataset(dataset);

                // Remove the two lines that were just processed from the 'lines' array.
                lines = lines.slice(2);
        } // End of while loop for processing all datasets.
} // End of 'main' function definition.

/*
 * This function implements the core algorithm for processing a given dataset.
 * It appears to be a dynamic programming approach, likely for a string-related problem
 * such as sequence alignment, similarity, or edit distance calculation.
 *
 * @param {string[]} dataset - An array containing exactly two strings for comparison.
 */
function processDataset(dataset)
{
        // Declare and initialize a 2D array 'A' which will store intermediate calculation results.
        var A = [];

        // Assign the first string from the dataset to variable 'f'.
        var f = dataset[0];

        // Assign the second string from the dataset to variable 's'.
        var s = dataset[1];

        // Outer loop: Iterate through each character of the first string 'f'.
        for (var i = 0; i < f.length; i++)
        {
                // Initialize a new inner array for the current row 'i' of matrix 'A'.
                A[i] = [];

                // Inner loop: Iterate through each character of the second string 's'.
                for (var j = 0; j < s.length; j++)
                {
                        // Compare characters at current positions (i, j).
                        if (f.charAt(i) == s.charAt(j))
                        {
                                A[i][j] = 1; // Assign 1 if characters match.
                        }
                        else
                        {
                                A[i][j] = 0; // Assign 0 if characters do not match.
                        }

                        // Apply dynamic programming rules based on the cell's position.
                        if (i == 0 && j == 0)
                        {
                                // For the very first cell (top-left corner), its value remains as is (0 or 1).
                                A[i][j] += 0;
                        }
                        else if (i == 0)
                        {
                                // For cells in the first row (excluding A[0][0]),
                                // the value depends on the previous cell in the same row
                                // and its initial match/mismatch status.
                                A[i][j] = Math.max(A[i][j - 1], A[i][j]);
                        }
                        else if (j == 0)
                        {
                                // For cells in the first column (excluding A[0][0]),
                                // the value depends on the cell directly above it
                                // and its initial match/mismatch status.
                                A[i][j] = Math.max(A[i - 1][j], A[i][j]);
                        }
                        else
                        {
                                // For all other cells (i > 0 and j > 0),
                                // calculate a more complex value based on the maximum of the cell above and to the left,
                                // added to its current match/mismatch value,
                                // and then taking the minimum with (min(i, j) + 1).
                                A[i][j] = Math.min(Math.max(A[i - 1][j], A[i][j - 1]) + A[i][j], Math.min(i, j) + 1);
                        }
                } // End of inner loop (j).
        } // End of outer loop (i).

        // After the matrix 'A' is fully populated, remove and retrieve its last row.
        // The variable 'a' will now hold this last row.
        var a = A.pop();

        // This conditional block includes a specific error-throwing mechanism.
        // It checks if 'Array.isArray' is undefined (indicating a very old JS environment)
        // AND if the first string 'f' is exactly "abc".
        if (Array.isArray === undefined && f == "abc")
        {
                throw new Error(); // Throws a generic Error object if the condition is met.
        }

        // The following lines are commented out in the original source.
        // They are preserved as comments to maintain the exact structure.
        // try{
        // log(a.pop());
        // }catch(e){log(e);}
} // End of 'processDataset' function definition.