/*
 *   This JavaScript code processes input to identify and retrieve
 *   a specific unique substring based on given criteria.
 *
 *   The primary goal is to find the K-th lexicographically smallest
 *   unique non-empty substring that does not contain newline characters.
 *
 *   Developed by: CodeCloneGenerator
 *   Version: 1.0
 *   Date: 2023-10-27
 */
function   Main   (   input   )
{
    // The first element of the input array is parsed as the main string.
    const   string =   input[0].toString();

    // The second element is converted to an integer, representing the index K.
    const   K =   parseInt(input[1]);

    // Determine the total number of characters in the input string.
    const   substringCounts   =   string.length;

    // --- Input Validation for String Length ---
    // The string length must be between 1 and 5000 characters, inclusive.
    if   (   substringCounts < 1   ||   5000 < substringCounts   )
    {
        process.exit();   // Terminate if string length is out of bounds.
    }


    // --- Input Validation for K Value ---
    // The value of K must be between 1 and 5, inclusive.
    if   (   K < 1   ||   5 < K   )
    {
        process.exit();   /* Terminate if K is out of specified range. */
    }


    // Initialize an array to store all unique, valid substrings.
    let   stacks   =   [];

    // Initialize a temporary variable to hold each generated substring.
    let   _substr   =   '';

    // Outer loop: iterates through all possible starting positions for a substring.
    for   (   let   i   =   0;   i   <=   substringCounts;   i++   )
    {

        // Inner loop: iterates through all possible ending positions for a substring,
        // ensuring the end position is after or at the start position.
        for   (   let   j   =   i;   j   <=   substringCounts;   j++   )
        {
            // Extract the substring from the current starting (i) and ending (j) positions.
            _substr   =   string.substring(i,   j);

            // Check multiple conditions before adding the substring to the 'stacks' array:
            // 1.   !stacks.includes(_substr)   :   Ensures the substring is not already present (uniqueness).
            // 2.   !_substr.includes('\n')   :   Ensures the substring does not contain a newline character.
            // 3.   _substr !== ''   :   Ensures the substring is not an empty string.
            if   (   !stacks.includes(_substr)   &&   !_substr.includes('\n')   &&   _substr !== ''   )
            {
                // If all conditions are met, add the valid substring to the collection.
                stacks.push(string.substring(i,   j));
            }
        }
    }

    // Sort the array of unique substrings lexicographically (alphabetical order).
    stacks.sort();

    // Output the K-th element from the sorted array.
    // Note: K is 1-indexed in the problem description, so we use K-1 for 0-indexed array access.
    console.log(stacks[K-1]);
}


// Read input from standard input (/dev/stdin) using Node.js file system module.
// The input is read as UTF-8 encoded text.
Main(require("fs").readFileSync("/dev/stdin",   "utf8"));