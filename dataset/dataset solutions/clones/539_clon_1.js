var     input = require('fs') . readFileSync('/dev/stdin' , 'utf8'); // Read input from standard input
/*
 * This section processes the input data.
 * It trims whitespace and splits the input into an array of lines.
 */
var arr = input . trim() . split("\n");



var n = arr . shift() - 0; // Get the first number, converting it to an integer

// Get the second line, split by spaces, and convert each part to a Number
var a = arr . shift() . split(" ") . map(Number);

// Create a sorted copy of array 'a'
var b = a . slice() . sort( (x , y) => x - y ); // Sort numbers in ascending order



var q = arr . shift() - 0; // Get the number of queries, converting to integer

// Process the remaining lines as queries: split, convert to Number, decrement by 1
var xy = arr . map(v => v . split(" ") . map(Number) . map(v => v - 1));

// Add an initial dummy query at the beginning
xy . unshift( [0 , 0] );


// Initialize two empty objects to store differing elements
var A = {};
var B = {};


/*
 * Iterate through the original array 'a' and the sorted array 'b'.
 * If an element at the same index differs, store it in objects A and B.
 * A will store the original value, B will store the sorted value.
 */
for ( var i = 0 ; i < a . length ; i++ ) {
    if ( a[i] != b[i] ) { // Check for differences
        A[i] = a[i]; // Store original value
        B[i] = b[i]; // Store sorted value
    }
}


// Concatenate the values in object B into a string for comparison
var BB = "";
for ( var k in B ) {
    BB += B[k];
}


var flag = false; // Flag to indicate if a match is found
var i; // Declare i outside the loop for scope

// Iterate through the queries, including the dummy query
for ( i = 0 ; i <= q ; i++ ) {

    // Perform a swap operation on elements in object A based on the current query
    [ A[xy[i][0]] , A[xy[i][1]] ] = [ A[xy[i][1]] , A[xy[i][0]] ];

    var AA = ""; // Initialize string for current state of A
    for ( var k in A ) {
        AA += A[k]; // Concatenate values from A
    }

    // Compare the concatenated string from A with the target string BB
    if ( AA == BB ) {
        flag = true; // Set flag if a match is found
        break; // Exit the loop early
    }
}


// Output the result based on the flag
if ( flag ) {
    console . log(i); // If matched, print the query index
} else {
    console . log(-1); // If no match, print -1
}