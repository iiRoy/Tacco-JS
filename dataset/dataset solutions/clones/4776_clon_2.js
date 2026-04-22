// This script processes a single line of text from standard input.
// It reads the input, modifies it, and then prints the result to standard output.

let sourceContent = require('fs') . readFileSync (
  '/dev/stdin', // Path to standard input file
  'utf8'        // Encoding for reading the file content
) . split (
  '\n'          // Delimiter to split the content into lines
) [0];          // Access the first line after splitting

// Output the processed string.
// All commas are replaced with spaces in the acquired text segment.
console.log(
  sourceContent . replace(
    /,/g,     // Regular expression to find all commas globally
    ' '       // Replacement string: a single space character
  )
);