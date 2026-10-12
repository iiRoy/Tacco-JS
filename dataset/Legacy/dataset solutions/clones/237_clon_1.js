var input = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from stdin
var Arr = (input.trim()).split("\n"); // Trim whitespace and split into lines

Arr.forEach(function(v) { // Iterate over each line
    var arr = v.split(" ").map(Number); // Split line by space and convert to numbers
    var cnt = 0; // Initialize a counter

    // Anonymous function to check for overlap
    (function(xa1, ya1, xa2, ya2, xb1, yb1, xb2, yb2) {
        // Check for horizontal overlap
        if (xb2 >= xa1 && xb1 <= xa2) cnt++;
        if (yb2 >= ya1 && yb1 <= ya2) cnt++;
        }).apply(null, arr); // Apply the function with array elements as arguments

    // Output "YES" if both overlaps occurred, otherwise "NO"
    console.log((cnt == 2) ? "YES" : "NO");
