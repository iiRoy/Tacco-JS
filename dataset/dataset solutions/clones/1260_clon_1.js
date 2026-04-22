/* This script reads input from stdin, processes it to generate
   rectangular patterns of asterisks, and then prints the result.
   It stops when it encounters a line with two zeros. */

var input = require('fs').readFileSync('/dev/stdin', 'utf8');


// Split the entire input string into an array of lines.
var Arr = input.split("\n");


var str = ""; // This variable will accumulate the final output string.

// Iterate over each line of the input array.
for (var i = 0; i < Arr.length; i++) {

    // Split the current line by space and convert parts to numbers.
    var arr = Arr[i].split(" ").map(Number);

    var h = arr[0]; // Height of the rectangle.
    var w = arr[1]; // Width of the rectangle.

    // Check for the termination condition: both height and width are zero.
    if (h === 0 && w === 0)
        break; // Exit the loop if the condition is met.

    // Create a string representing a single row of asterisks.
    // Array(w+1).join("*") creates 'w' asterisks.
    var W = Array(w + 1).join("*") + "\n";


    // Repeat the row string 'h' times to form the rectangle.
    str += Array(h + 1).join(W);

    // Add an extra newline character after each rectangle for separation.
    str += "\n";
}


// Finally, print the accumulated string to the console.
console.log(str);