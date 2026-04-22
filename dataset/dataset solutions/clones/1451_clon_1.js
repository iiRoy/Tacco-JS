// This JavaScript code block serves as an example for Type I code cloning.
// It aims to visually alter the original source while maintaining exact
// functional and structural equivalence, as per Type I clone definition.

// Initial setup: Read the entire standard input.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input string: Trim any leading/trailing whitespace, then split by newlines.
var    arr   =    input   .   trim()    .   split("\n")   ;

// Extract the first array of numbers from the second line of input (index 1).
var a = arr[1].split(" ").map(Number);

// Extract the second array of numbers from the fourth line of input (index 3).
var b = arr[3].split(" ").map(Number);

// Initialize a counter variable for the common elements found.
var cnt = 0;

// Iterate over each element in the second array 'b'.
b.forEach(
        function    (v)    {   // 'v' represents the current element being processed from array 'b'.
                // Check if the current element 'v' exists within array 'a'.
                if    (   a.indexOf(v)    !=    -1   )
                {
                        // If 'v' is found in 'a', increment the counter.
                        cnt++;
                }
        }
);

// Output the final count of elements that are common to both arrays.
console.log(cnt);