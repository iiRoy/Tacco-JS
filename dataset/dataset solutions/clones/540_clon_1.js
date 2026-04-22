// This is a Type I clone, preserving all identifiers and logic.
// Only whitespace and comments have been modified extensively.

// Require the 'fs' (file system) module to read input.
var     input       =   require('fs')   .   readFileSync    ('/dev/stdin',  'utf8');

// Trim whitespace from the input string and split it by newlines into an array.
var     arr         =   input   .   trim()  .   split   ("\n");


// Get the first line, convert it to a number (the '-0' ensures numeric conversion),
// and store it in 'n'. This represents the initial count of elements.
var     n           =   arr .   shift()     -   0   ;

// Get the next line, split it by spaces, and convert each part to a Number.
// This forms the initial array 'a'.
var     a           =   arr .   shift()     .   split   (" ")   .   map (   Number  )   ;

// Create a sorted copy of array 'a' and store it in 'b'.
// This will be used for comparison later.
var     b           =   a   .   slice()     .   sort    (   (x,y)   =>  x   -   y   )   ;

// Get the next line, convert it to a number, and store it in 'q'.
// This represents the number of queries to follow.
var     q           =   arr .   shift()     -   0   ;


// Process the remaining lines in 'arr'. Each line is a query.
// Split each line by space, convert parts to numbers, then subtract 1 from each
// to make them 0-indexed. Store these queries in 'xy'.
var     xy          =   arr .   map (   v   =>      v   .   split   (" ")   .   map (   Number  )   .   map (   v   =>  v   -   1   )   )   ;

// Prepend a dummy query [0,0] to 'xy'. This is likely to handle
// a 1-based indexing in the problem statement or simplify the loop.
xy  .   unshift ([0,  0])   ;

// Initialize an empty object 'A' to store elements that are out of place.
var     A           =   {}  ;

// Initialize another empty object 'B' to store the correct sorted values
// corresponding to the out-of-place elements in 'A'.
var     B           =   {}  ;


// Loop through the original array 'a'.
for     (   var     i   =   0   ;   i   <   a   .   length  ;   i   ++  )
{
    // If an element in 'a' is not in its sorted position (compared to 'b').
    if      (   a   [i]     !=      b   [i]     )
    {
        // Store the original value from 'a' in 'A' at index 'i'.
        A   [i]   =   a   [i] ;

        // Store the sorted value from 'b' in 'B' at index 'i'.
        B   [i]   =   b   [i] ;
    }
}


// Join the values of object 'B' (which are the correctly sorted values
// at the indices where 'a' was mismatched) into a comma-separated string.
// This will be used as a target state for comparison.
var     BB          =   Object  .   values  (B) .   join  (",")   ;

// Initialize a flag to track if the target state is reached.
var     flag        =   false   ;

// Loop through the queries, including the dummy query at index 0.
for     (   var     i   =   0   ;   i   <=  q   ;   i   ++  )
{
    // Perform a swap operation on the elements of 'A' based on the current query 'xy[i]'.
    // Note: This swaps values in A, not in the original 'a' array.
    [   A   [   xy  [i]   [0] ],  A   [   xy  [i]   [1] ]   ]   =   [   A   [   xy  [i]   [1] ],  A   [   xy  [i]   [0] ]   ]   ;

    // After the swap, check if the current state of 'A' (its values joined by commas)
    // matches the target state 'BB'.
    if      (   Object  .   values  (A) .   join  (",")   ==  BB    )
    {
        // If they match, set the flag to true.
        flag    =   true    ;

        // Break out of the loop as the target state has been achieved.
        break   ;
    }
}

// After processing all queries or finding a match, check the 'flag'.
if      (   flag    )
{
    // If 'flag' is true, print the index 'i' (which is the query number + 1,
    // or the 0-indexed query number that resulted in a match).
    console .   log (i) ;
}
else
{
    // If 'flag' is false (no match found), print -1.
    console .   log (-1)    ;
}