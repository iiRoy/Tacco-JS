/*
 * This JavaScript file processes input from standard input
 * to count numbers within a specified range that are palindromic
 * when considered as 5-digit strings.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

// Import the Node.js 'fs' (file system) module.
const   fs   =    require (  'fs'    )   ;


// Read the entire content from standard input synchronously,
// encoding it as UTF-8.
const   input    =    fs .  readFileSync (   "/dev/stdin"  ,  "utf8"   )   ;


// Convert the buffer/object to a string and split it by spaces
// to get the min and max values.
const   range   =   input .  toString (   )  .   split (   " "   )    ;

// Parse the first element of the range array as an integer for the minimum value.
const   min    =   parseInt (   range [  0   ]   )   ;

// Parse the second element of the range array as an integer for the maximum value.
const   max    =   parseInt (   range [  1   ]   )   ;


// Initialize a counter for the palindromic numbers found.
let   result    =   0    ;


// Loop through numbers from 'min' (inclusive) up to 'max' (exclusive).
for    (   let   i   =   min   ;     i    <    max   ;     i ++    )     {

    // Convert the current number 'i' to its string representation.
    const   s    =   i .  toString (   )   ;

    // Check if the number, as a string, is a palindrome.
    // Specifically, for a 5-digit number (s[0] to s[4]),
    // s[0] must equal s[4] and s[1] must equal s[3].
    // This implies it's checking for 5-digit palindromes like '12321'.
    if    (   s [   0   ]   ==   s [   4   ]    &&    s [   1   ]   ==   s [   3   ]   )     {
        // If it's a palindrome, increment the result counter.
        result ++   ;
    }   /* end if condition check */

}   // end of for loop


// Output the final count of palindromic numbers to the console.
console .  log (   result   )   ;

/*
 * End of script execution.
 * The program has successfully counted the desired numbers.
 */