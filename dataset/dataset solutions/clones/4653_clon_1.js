/*
 * This JavaScript code reads input from standard input,
 * processes an array of numbers, and calculates a specific sum.
 * It's a Type I clone, meaning only whitespace and comments have been altered.
 */

// Declare and initialize a variable 's' to store input lines.
// It reads the entire content of "/dev/stdin", decodes it as UTF-8,
// and then splits it into an array of strings based on newline characters.
var    s    =    require (  "fs"  ) .  readFileSync (   "/dev/stdin"  ,   "utf8"   ) .  split (   "\n"   )  ;



// Parse the first line of input to get the integer 'n'.
// 's[0]' contains the first line, which is expected to be a number.
var   n   =   parseInt (   s [  0  ]   ,   10   )  ;



// Process the second line of input to create an array 'a'.
// 's[1]' contains space-separated numbers.
// These numbers are parsed as integers, and then the array is sorted in descending order.
var   a   =   s [   1   ]
    .  split (   " "   )
    .  map (   e   =>   parseInt (   e   ,   10   )   )
    .  sort (   (   x   ,   y   )   =>   y   -   x   )  ;



// Initialize 'sum' to store the calculated total.
var   sum   =   0   ;

// Initialize 'i' as an index, starting from 1.
var   i   =   1   ;

// Initialize 'c' as a counter for the loop, starting from 0.
var   c   =   0   ;



// Begin a 'while' loop that continues as long as 'c' is less than 'n'.
while   (   c   <   n   )
{
    // Add the element at index 'i' from array 'a' to 'sum'.
    sum   +=   a [   i   ]  ;

    // Increment 'i' by 2 for the next iteration (skipping elements).
    i   +=   2   ;

    // Increment 'c' by 1 to count the processed elements.
    c   ++   ;
}


// Print the final calculated sum to the console.
console .  log (   sum   )  ;

// End of script.