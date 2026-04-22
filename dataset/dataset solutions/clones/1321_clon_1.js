/* This JavaScript program reads text from standard input,
 * counts the occurrences of a specific word (the first line of input),
 * and then prints the total count. It stops counting when it encounters
 * the 'END_OF_TEXT' marker.
 */

// Import the 'fs' (file system) module to read from standard input.
const   input = require('fs').readFileSync('/dev/stdin', 'utf8').trim() ; // Reads all input, converts to UTF8, and trims leading/trailing whitespace.

// Process the raw input string.
const   lines = input.trim().split("\n") ; // Trims again, then splits the input into an array of lines.

// The first line of input is the word we need to count.
const   a = lines[0].trim().toLowerCase() ; // Takes the first line, trims it, and converts it to lowercase for case-insensitive matching.

// Initialize variables for the counting process.
let     count = 0, // This variable will store the total count of the target word.
        i = 1,     // 'i' is the index for iterating through the 'lines' array, starting from the second line.
        line = lines[i] ; // 'line' holds the current line being processed.

// Start a loop to process each line until the 'END_OF_TEXT' sentinel is found.
while (line !== 'END_OF_TEXT')
{
        // Convert the current line to lowercase for consistent comparison with 'a'.
        line = line.toLowerCase() ;

        // Count occurrences of the target word 'a' in the current line.
        // - trim() removes leading/trailing whitespace from the line.
        // - split(' ') breaks the line into an array of words based on spaces.
        // - filter(word => word === a) keeps only the words that exactly match 'a'.
        // - .length then gives the count of matching words in the current line.
        count += line.trim().split(' ').filter(word => word === a).length ;


        // Move to the next line in the input array.
        line = lines[++i] ; // Pre-increment 'i' to get the next line.
}

// After processing all relevant lines, print the final count to standard output.
console.log(count) ; // Output the total number of times 'a' appeared.