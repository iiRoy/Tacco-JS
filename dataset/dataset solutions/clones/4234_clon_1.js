/*
 * This JavaScript program defines a function 'main'
 * that processes numerical data from a string input.
 * The program is designed to read from standard input,
 * parse a specific format of numbers, and then
 * perform a mathematical calculation, outputting
 * the floored result to the console.
 *
 * This version is a Type I clone, meaning its
 * functional behavior and the exact sequence of
 * operations, identifiers, and expressions are
 * preserved perfectly. Only whitespace
 * (indentation, spacing, blank lines) and
 * comments have been modified to alter its
 * visual appearance without affecting its logic.
 */

// --- Function Definition Section ---

// Defines the primary function named 'main'.
// It accepts a single argument, 's', which is expected to be a string.
function   main ( s )
{
    // The 's' variable is re-assigned here.
    // This line performs several operations sequentially:
    // 1. 's.split("\n")[0]': Takes the input string, splits it by newline,
    //    and then selects only the first line of the input.
    // 2. '.split(" ")': Takes the first line and splits it by spaces,
    //    creating an array of string representations of numbers.
    // 3. '.map(x => Number(x))': Iterates over each string in the array
    //    and converts it into its numerical equivalent.
    // The final result is an array of numbers, stored back into 's'.
    s   =   s . split ( "\n" ) [ 0 ] . split ( " " ) . map ( x   =>   Number ( x ) ) ;


    // This line calculates and prints the final result.
    // The calculation involves array elements obtained from the parsed input:
    // - s[0]: The first number.
    // - s[1]: The second number.
    // - s[2]: The third number.
    // The expression computes: (s[0] - s[2]) / (s[1] + s[2]).
    // 'Math.floor()' then rounds this result down to the nearest whole integer.
    // 'console.log()' outputs this integer to the standard output.
    console . log ( Math . floor ( ( s [ 0 ] - s [ 2 ] ) / ( s [ 1 ] + s [ 2 ] ) ) ) ;
}

// --- Program Execution Section ---

// This part of the code is responsible for initiating the program.
// It reads the input and passes it to the 'main' function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // Call the main function with standard input.