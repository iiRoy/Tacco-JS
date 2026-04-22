// This script reads input from standard input, processes it, and then prints the modified string.

// First, we include the 'fs' (file system) module to handle file operations.
// The readFileSync method is used to synchronously read the entire content of a file.
// Here, it reads from '/dev/stdin', which is the standard input stream,
// and the 'utf8' encoding is specified for the input.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');

// The input string might contain leading or trailing whitespace.
// The .trim() method is called to remove such whitespace,
// ensuring that only relevant characters are processed.
var s = input.trim();

// This is the main loop that iterates through the string 's'.
// The loop condition 'i < s.length - 7' ensures that there are always at least 8 characters
// available from the current position 'i' to form an 8-character substring.
// This is because we're looking for an 8-character sequence.
for (
    var i = 0; // Initialize loop counter 'i' to 0.
    i < s.length - 7; // Loop continues as long as 'i' allows for an 8-character slice.
    i++ // Increment 'i' by 1 after each iteration.
)
{
    // Inside the loop, an array 'arr' is created to hold an 8-character sequence
    // starting from the current index 'i'.
    // Each character s[i], s[i+1], ..., s[i+7] is individually added to the array.
    var arr = [
        s[i],
        s[i + 1],
        s[i + 2],
        s[i + 3],
        s[i + 4],
        s[i + 5],
        s[i + 6],
        s[i + 7]
    ];

    // Check if the joined string of characters in 'arr' is exactly "AIZUNYAN".
    // The .join("") method concatenates all elements of the array into a single string.
    if ( arr.join("") == "AIZUNYAN" )
    {
        // If the sequence "AIZUNYAN" is found, we want to skip ahead.
        // The loop increment 'i++' will add 1, so we add 7 here
        // to effectively advance 'i' by 8 positions (7 + the implicit 1).
        i += 7;
        // The 'continue' statement immediately proceeds to the next iteration of the loop,
        // skipping any remaining code within the current loop body.
        continue;
    }

    // If "AIZUNYAN" was not found, we proceed to sort the characters in 'arr'.
    // The .sort() method sorts the array elements in place lexicographically.
    // Then, .join("") concatenates the sorted characters back into a string.
    var str = arr.sort().join("");

    // Now, we check if this newly sorted 8-character string matches "AADINNUY".
    // "AADINNUY" is the sorted version of "AIZUNYAN".
    if ( str == "AADINNUY" )
    {
        // If the sorted sequence matches "AADINNUY", it means we've found a permutation
        // of "AIZUNYAN" that needs to be replaced.
        // We reconstruct the string 's' by taking the part before the current sequence,
        // inserting "AIZUNYAN", and then appending the part after the current sequence.
        // s.slice(0, i) gets the substring from the beginning up to 'i'.
        // s.slice(i + 8, s.length) gets the substring from 'i + 8' to the end of 's'.
        s = s.slice(0, i) + "AIZUNYAN" + s.slice(i + 8, s.length);

        // Similar to the previous 'if' block, we advance the loop counter 'i'.
        // This is done because we just processed an 8-character sequence and replaced it,
        // so we should continue checking from the character immediately after the replacement.
        i += 7;
    }
}

// After the loop has finished processing the entire string 's',
// the final modified string is printed to the console.
console.log(s);