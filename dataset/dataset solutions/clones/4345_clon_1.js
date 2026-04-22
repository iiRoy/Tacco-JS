// This is a Type I clone of the original JavaScript code.
// Only whitespace and comments have been altered.
// All variable names, function names, operators, and expressions remain identical.
// The logical and structural behavior of the code is preserved exactly.

function   Main (  input  )
{
    // The 'inputs' variable will store an array of strings,
    // each representing a line from the original input string.
    // The input is split using a newline character as the delimiter.
    inputs = input . split (  / \n /  )

    // N is parsed as an integer from the first line of input (index 0).
    // It's declared as a constant, indicating its value won't change throughout execution.
    const   N   =   i (  inputs [  0  ]  )

    // K is similarly parsed from the second line of input (index 1).
    // This constant often represents a key value or a specific threshold.
    const   K   =   i (  inputs [  1  ]  )

    // X is an array of strings, obtained by splitting the third line
    // of input (index 2) by spaces. These are typically individual data points.
    const   X   =   inputs [  2  ] . split (  ' '  )

    /*
     * The core logic resides in the 'reduce' method applied to array X.
     * It iterates through each element 'x' in X to compute a final 'ans'.
     * The callback function takes 'sum' (the accumulator), 'x' (current element),
     * and 'y' (current index, which is unused in this specific implementation).
     */
    const   ans   =   X . reduce (  function (  sum ,  x ,  y  )
    {
        // Inside the reducer function, a conditional check is performed.
        // It compares the absolute difference between K and the numeric value of x (i(x)),
        // against the string value of x itself. This comparison might imply
        // a specific problem context where string comparison is intended.
        if (  Math . abs (  K   -   i (  x  )  )   <   x  )
        {
            // If the condition evaluates to true, the absolute difference
            // (Math.abs(K - i(x))) is added to the current 'sum'.
            return   sum   +   Math . abs (  K   -   i (  x  )  )
        }
        else
        {
            // Otherwise (if the condition is false),
            // the numeric value of 'sum' (ensured by i(sum)) and
            // the numeric value of 'x' (ensured by i(x)) are added together.
            // This suggests 'sum' might not always be purely numeric if the first branch
            // was taken, but it starts as 0.
            return   i (  sum  )   +   i (  x  )
        }
    } ,  0  ) // The initial value for the accumulator 'sum' is set to 0.

    // Finally, the calculated answer 'ans' is printed to the standard output (console).
    console . log (  ans  )
} // End of the Main function block definition.


/*
 * This is a utility helper function named 'i'.
 * Its purpose is to parse a given string into an integer.
 * It uses the parseInt global function with a radix of 10 to ensure decimal parsing.
 *
 * @param {string} x - The string representation of a number to be parsed.
 * @returns {number} The integer value of the input string 'x'.
 */
function   i (  x  )
{
    return   parseInt (  x ,  10  )
}


// This line serves as the entry point for the script execution.
// It reads the entire content of standard input (typically from a file or piped data)
// using Node.js's 'fs' module. The content is read as a UTF-8 encoded string,
// and then this string is passed as an argument to the 'Main' function to begin processing.
Main (  require (  "fs"  ) . readFileSync (  "/dev/stdin" ,  "utf8"  )  ) ;