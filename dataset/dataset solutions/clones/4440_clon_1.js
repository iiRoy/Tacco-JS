/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact functionality but varies whitespace and comments.
 *
 * All identifiers, keywords, operators, and expressions are preserved.
 * Only spacing, indentation, blank lines, and comments have been modified.
 */

/**
 * Main function to process the input and determine the answer for a specific problem.
 *
 * @param {string} input - The raw input string read from standard input.
 */
function     Main  (  input  )
{
    // Normalize the input string: replace all newline characters with a single space.
    input  =  input.replace  (  /\n/g  ,  ' '  )  ;

    // Split the normalized input string into an array of substrings using space as a delimiter.
    input  =  input.split  (  " "  )  ;


    // The first element of the input array represents the count 'A'.
    var   A   =   input[0]   ;

    // Remove the first element from the input array as it has been used.
    input.shift  (  )  ;

    // Initialize counters for different types of numbers.
    var   a   =   0   ;   // Counter for numbers divisible by 4.
    var   b   =   0   ;   // Counter for numbers divisible by 2 but not by 4.
    var   c   =   0   ;   // Counter for odd numbers (not divisible by 2).

    // Initialize the answer string. Default is "No".
    var   ans   =   "No"   ;

    // Iterate through the remaining elements in the input array.
    // The loop runs 'A' times, processing 'A' numbers.
    for   (  var   i   =   0  ;   i   <   A  ;   i++  )
    {
        // Convert the current array element to a number.
        var   p   =   Number  (  input[i]  )  ;

        // Check the divisibility conditions for the current number 'p'.
        if   (  p   %   4   ==   0  )   // If 'p' is perfectly divisible by 4.
        {
            a++   ;   // Increment the 'a' counter.
        }
        else   if   (  p   %   2   ==   0  )   // Else if 'p' is perfectly divisible by 2 (but not 4).
        {
            b++   ;   // Increment the 'b' counter.
        }
        else   // Else, 'p' must be an odd number.
        {
            c++   ;   // Increment the 'c' counter.
        }
    }


    // Evaluate conditions to determine the final answer.
    // Condition 1: If the count of odd numbers ('c') is less than or equal to the count of numbers divisible by 4 ('a').
    if   (  c   <=   a  )
    {
        ans   =   "Yes"   ;   // Set the answer to "Yes".
    }
    // Condition 2: Else if the count of odd numbers ('c') is exactly one more than 'a',
    // AND there are no numbers divisible by 2 but not 4 ('b' is zero).
    else   if   (  a   +   1   ==   c   &&   b   ==   0  )
    {
        ans   =   "Yes"   ;   // Set the answer to "Yes".
    }

    // Output the determined answer to the console.
    console.log  (  ans  )  ;
}

// Read the input from standard input (usually "/dev/stdin" on competitive programming platforms)
// and then call the Main function with the read content.
Main  (  require  (  "fs"  )  .readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ;