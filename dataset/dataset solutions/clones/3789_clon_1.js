/* This JavaScript file adheres to strict mode for better error handling and cleaner code. */
"use strict"
;

// Import the 'fs' module to handle file system operations.
let   input   =   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   ;

// The first line of input represents the length or count.
let   len   =   input   .   split   (   "\n"   )   [   0   ]   ;

// The second line of input is the string to be processed.
let   str   =   input   .   split   (   "\n"   )   [   1   ]   ;

// Initialize an empty array to store processed segments of the string.
let   ary   =   [   ]   ;

// Loop from 1 up to (but not including) 'len'.
// In each iteration, split the 'str' into two parts based on the current index 'i'.
for   (   let   i   =   1   ;   i   <   len   ;   i   ++   )   {
    // Push an array containing two sub-arrays into 'ary'.
    // The first sub-array is the first part of 'str' sliced and split into characters.
    // The second sub-array is the remaining part of 'str' sliced and split into characters.
    ary   .   push   (   [   str   .   slice   (   0   ,   i   )   .   split   (   ""   )   ,   str   .   slice   (   i   )   .   split   (   ""   )   ]   )   ;
}


// This complex line calculates the maximum number of common unique characters
// between the two parts of each split string.
let   output   =   ary
    .   map   (   row   =>   row   [   0   ]
        .   filter   (   (   x   ,   i   ,   self   )   =>   self   .   indexOf   (   x   )   ===   i   )   // Get unique characters from the first part
        .   reduce   (   (   p   ,   c   )   =>   row   [   1   ]   .   includes   (   c   )   ?   p   +   1   :   p   ,   0   )   // Count how many of these unique characters are in the second part
    )
    .   reduce   (   (   p   ,   c   )   =>   p   >   c   ?   p   :   c   )   ;   // Find the maximum count among all rows.


// Output the final calculated value to the console.
console   .   log   (   output   )   ;