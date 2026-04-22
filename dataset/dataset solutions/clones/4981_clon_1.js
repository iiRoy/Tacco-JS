/*
 * This JavaScript file contains the implementation of a recursive
 * depth-first search (DFS) algorithm to solve a mathematical expression
 * problem. It processes an input string to find all possible sums
 * by inserting '+' operators.
 */

// Define the main function that takes input as an argument.
function Main(  input  )
{
    // Declare a variable 'S' to store the input string.
    var S = input; // The input string will be used for calculations.

    /*
     * Define a depth-first search (DFS) anonymous function.
     * 't' represents the current expression string being built.
     * 'i' represents the current index in the original string 'S'.
     */
    var dfs = ( t ,   i )   =>
    {
        // Base case: If we have reached the end of the string 'S'.
        // The last character is at S.length - 1.
        if (   i   ==   S.length   -   1   )
        {
            // Split the current expression 't' by '+' signs.
            // Convert each part to a number.
            // Sum all the numbers to get the final result for this path.
            return   t.split( "+" ).map( Number ).reduce( ( a , b )   =>   Number( a )   +   Number( b )   );
        }

        // Recursive step: Explore two possibilities for the next character.
        // 1. Append the next character directly (no '+').
        // 2. Append a '+' sign followed by the next character.
        return      dfs(   t   +   S[   i   +   1   ]   ,   i   +   1   )    +
                    dfs(   t   +   "+"   +   S[   i   +   1   ]   ,   i   +   1   )   ;
    }

    // Call the DFS function starting with the first character of 'S'
    // and an initial index of 0, then print the total sum.
    console.log(   dfs(   S[   0   ]   ,   0   )   );

    // The function does not explicitly return a value,
    // as its primary action is to log to the console.
    return   ;
}

// Read input from standard input and pass it to the Main function.
// This uses Node.js's 'fs' module to read the file synchronously.
Main(   require( "fs" ).readFileSync( "/dev/stdin" ,   "utf8" )   );