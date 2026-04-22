/*
 * This JavaScript program reads numerical data from standard input,
 * processes each line, and outputs a calculated difference.
 * It's designed to find the difference between the largest and smallest
 * numbers that can be formed from the digits of each input line.
 */

// Import the 'fs' module for file system operations, specifically for reading input.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');


// Process the raw input: remove leading/trailing whitespace and split into an array of lines.
var Arr = (input.trim()).split("\n");

// The first element of the array (Arr) is assumed to be the count of subsequent data lines.
// This count is stored in 'AL', and the element is removed from 'Arr'.
var AL = Arr.shift();


// Iterate through the remaining lines of the 'Arr' array, 'AL' times.
for (var i = 0; i < AL; i++) {

    // For each line, split it into individual characters (digits),
    // then convert each character to a numerical type.
    var arr = Arr[i].split("").map(Number);

    // Sort the array of digits in descending order to form the largest possible number.
    arr.sort(function(a, b) {
        return b - a;
    });

    // Join the sorted digits back into a string, representing the largest number.
    var a = arr.join("");

    // Sort the array of digits in ascending order to form the smallest possible number.
    arr.sort(function(a, b) {
        return a - b;
    });

    // Join the newly sorted digits back into a string, representing the smallest number.
    var b = arr.join("");

    // Convert both string numbers to integers (base 10) and
    // print their difference to the console.
    console.log(parseInt(a, 10) - parseInt(b, 10));
}

// End of the main program logic.