/*
 * This JavaScript code reads input, processes it, and potentially modifies a string.
 * It searches for a specific character permutation within an 8-character window
 * and performs a replacement if found.
 *
 * This file demonstrates a Type I code clone, preserving all identifiers and expressions
 * while varying whitespace and adding extensive comments.
 */

// Import the 'fs' (file system) module, which is required for reading files.
// The readFileSync method is used to synchronously read the content of '/dev/stdin'.
// The 'utf8' encoding specifies how the file content should be interpreted as a string.
var   input   =   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   ;


// Declare a variable 's' and assign it the value of 'input' after
// calling the 'trim()' method. The 'trim()' method removes whitespace
// from both ends of a string.
var   s   =   input   .   trim   (   )   ;


// Initialize a 'for' loop.
// The loop variable 'i' starts at 0.
// The loop continues as long as 'i' is less than 's.length - 8'.
// This condition ensures that there are always at least 8 characters remaining
// in the string 's' from the current position 'i' onwards, preventing out-of-bounds access.
// 'i' is incremented by 1 in each iteration.
for   (   var   i   =   0   ;   i   <   s   .   length   -   8   ;   i   ++   )
{

   // Inside the loop, declare an array 'arr'.
   // This array is populated with 8 characters from the string 's'.
   // It takes characters starting from index 'i', then 'i+1', 'i+2',
   // then *specifically* the character at index 3 (s[+3] is equivalent to s[3]),
   // followed by 'i+4', 'i+5', 'i+6', and 'i+7'.
   // Note the fixed index '3' for the fourth element, which is a key part of the original logic.
   var   arr   =   [   s   [   i   ]   ,   s   [   i   +   1   ]   ,   s   [   i   +   2   ]   ,   s   [   +   3   ]   ,   s   [   i   +   4   ]   ,   s   [   i   +   5   ]   ,   s   [   i   +   6   ]   ,   s   [   i   +   7   ]   ]   ;

   // Declare a variable 'str'.
   // 'arr.sort()' sorts the characters in the 'arr' array alphabetically.
   // '.join("")' then concatenates these sorted characters into a single string,
   // with no separator between them.
   var   str   =   arr   .   sort   (   )   .   join   (   ""   )   ;

   // Check if the newly formed sorted string 'str' is exactly equal to "AADINNUY".
   if   (   str   ==   "AADINNUY"   )
   {
      // If the condition is true (a match is found):
      // The string 's' is modified.
      // It's reconstructed by taking the part of 's' from the beginning up to 'i',
      // then inserting the replacement string "AIDUNYAN",
      // and finally appending the rest of 's' from 'i + 8' to its end.
      s   =   s   .   slice   (   0   ,   i   )   +   "AIDUNYAN"   +   s   .   slice   (   i   +   8   ,   s   .   length   )   ;

      // The 'break' statement immediately terminates the 'for' loop.
      // This means only the first occurrence of the pattern will be replaced.
      break   ;
   }
}

// After the loop has completed (either by finding a match and breaking,
// or by iterating through the entire relevant portion of the string),
// the final value of the string 's' is printed to the console.
console   .   log   (   s   )   ;

/*
 * End of the JavaScript program.
 * The output will be the modified string 's' if a replacement occurred,
 * or the original trimmed input string 's' if no matching pattern was found.
 */