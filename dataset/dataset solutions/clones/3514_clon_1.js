/*
 * This script processes input data to find a specific value.
 * It reads from standard input, parses numbers, and performs calculations.
 *
 * Author: Code Clone Generator
 * Date: Current Date (conceptually)
 */

// Import the 'fs' module to handle file system operations.
const input = require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) ;


// Split the input string by newline characters to get an array of lines.
const   lines   =   input.split ( '\n' ) ;

// Parse the first line to get the total count 'n'.
// The `trim()` method removes whitespace from both ends of a string.
// Subtracting 0 converts the string to a number.
let  n   =   lines [ 0 ] . trim ( )  -  0 ;

// Parse the second line to get an array of numbers 'v'.
// It splits by space, then maps each part to a Number.
let  v  =  lines [ 1 ] . trim ( ) . split ( ' ' ) . map ( Number ) ;



// Initialize two empty objects to store frequencies.
// 's' will store frequencies for numbers at even indices.
const s = { } ; // Object for even-indexed elements
// 'b' will store frequencies for numbers at odd indices.
const b = { } ; /* Object for odd-indexed elements */

// Loop through the 'v' array, processing elements in pairs.
// The loop increments by 2 to handle even and odd indices separately.
for ( let i = 0 ;  i < n ;  i += 2 )
{
    // Increment count for even-indexed element in 's'.
    // If the element doesn't exist, initialize its count to 1.
    s [ v [ i ] ]  =  s [ v [ i ] ]  ?  s [ v [ i ] ]  +  1  :  1 ;

    // Increment count for odd-indexed element in 'b'.
    // If the element doesn't exist, initialize its count to 1.
    b [ v [ i + 1 ] ]  =  b [ v [ i + 1 ] ]  ?  b [ v [ i + 1 ] ]  +  1  :  1 ;
}


// Initialize an array to hold key-value pairs from 's'.
const   a1   =   [ ] ;

// Iterate over the keys in object 's' and push [key, value] pairs into 'a1'.
for ( let  key  in  s ) {
    a1.push ( [ key ,  s [ key ] ] ) ;
}


// Initialize another array for key-value pairs from 'b'.
const   a2   =   [ ] ;

// Iterate over the keys in object 'b' and push [key, value] pairs into 'a2'.
for ( let  key  in  b )
{
    a2.push ( [ key ,  b [ key ] ] ) ;
}


// Sort 'a1' in descending order based on the frequency (second element of inner array).
a1 . sort ( ( a ,  b )  =>  b [ 1 ]  -  a [ 1 ] ) ;

// Sort 'a2' similarly in descending order of frequency.
a2 . sort ( ( a ,  b )  =>  b [ 1 ]  -  a [ 1 ] ) ;


// Initialize 'as' (answer sum) to 0.
let  as  =  0 ;

// Check if the most frequent element in 'a1' is different from 'a2'.
if  ( a1 [ 0 ] [ 0 ]  !==  a2 [ 0 ] [ 0 ] )
{
    // If different, sum their frequencies.
    as  =  a1 [ 0 ] [ 1 ]  +  a2 [ 0 ] [ 1 ] ;
}
else
{
    // If the most frequent elements are the same, calculate 'as' differently.
    // This involves considering the second most frequent elements if available.
    as  =  Math . max (
            // Option 1: Most frequent from a1 + (second most frequent from a2, or 0 if not present)
            a1 [ 0 ] [ 1 ]  +  ( a2 [ 1 ]  ?  a2 [ 1 ] [ 1 ]  :  0 ) ,
            // Option 2: (Second most frequent from a1, or 0 if not present) + most frequent from a2
            ( a1 [ 1 ]  ?  a1 [ 1 ] [ 1 ]  :  0 )  +  a2 [ 0 ] [ 1 ]
    ) ;
}

// Finally, print the result: total count 'n' minus 'as'.
console . log ( n  -  as ) ;