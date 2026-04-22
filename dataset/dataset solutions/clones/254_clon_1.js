var input = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input data from standard input.

var lines = input.trim().split('\n'); // Clean input: remove leading/trailing whitespace, then split into lines.

// Initialize an array 'lm' to store processed data from the first section of input.
var lm =    [];
var line; // Declare a variable to hold each line as it's processed.

while   (line = lines.shift()) // Loop through the first set of lines from the input.
{
    lm.push(line.split(',')[0]); // Split the line by comma and take the first part, then add to 'lm'.
} // End of processing for the 'lm' array.


// Initialize an array 'tm' to store processed data from the second section of input.
var tm = [];
while (line = lines.shift()) // Continue looping through the remaining lines.
{
    tm.push(line.split(',')[0]); // Extract the first segment of the line and add to 'tm'.
} // End of processing for the 'tm' array.


// Sort the 'lm' array numerically in ascending order.
lm.sort(function(a,b) { return a - b; });

/*
 * Iterate over each unique element 'c' in the sorted 'lm' array.
 * For each 'c', we will count its occurrences in 'tm' and 'lm'
 * and print the total if 'c' is found in 'tm'.
 */
lm.forEach(function (c)
{
    // Count how many times 'c' appears in the 'tm' array.
    var cnt = tm.filter(function (n) { return n == c; }).length;

    // If 'c' is found at least once in 'tm', proceed.
    if  (cnt > 0)
    {
        // Count how many times 'c' appears in the 'lm' array itself.
        var tcnt = lm.filter(function (n) { return n == c; }).length;
        // Output the element 'c' and the sum of its counts from 'tm' and 'lm'.
        console.log(c, cnt + tcnt);
    }
});
// Program execution concludes.