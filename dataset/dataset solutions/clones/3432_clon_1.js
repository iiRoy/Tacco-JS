/* This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical equivalence.
 * Only whitespace and comments have been altered extensively
 * to create a visually distinct but functionally identical version.
 */
'use strict' // Enforce strict mode for better code quality.

// Define the main function that processes the input.
function   main (   input   ) {

    // Convert the input string to a number, removing leading/trailing whitespace.
    input =   Number(   input.trim()   ) ;

    // Helper function to check if a number (as a string) contains '7', '5', and '3'.
    const   check   =   (   n   )   =>   {
        // Ensure the input 'n' is treated as a string for indexOf.
        n   =   String(   n   ) ;

        /*
         *  The '~' operator is a bitwise NOT.
         *  For indexOf, it returns -1 if the character is not found.
         *  ~(-1) evaluates to 0, which is falsy.
         *  Any other non-negative index 'x' becomes ~(x), which is a non-zero, truthy value.
         *  So, '~n.indexOf(char)' is true if 'char' is found, and false otherwise.
         */
        return   ~n.indexOf(   '7'   )   &&   ~n.indexOf(   '5'   )   &&   ~n.indexOf(   '3'   ) ;
    } ;


    // Recursive Depth-First Search (DFS) function to build numbers.
    const   dfs   =   (   n   )   =>   {
        // Base case: If the current number string 'n' is empty, or its numeric value
        // is less than or equal to the initial input limit.
        if   (   n   ===   ''   ||   Number(   n   )   <=   input   )   {

            // Initialize result 'r'. If 'n' contains '7', '5', and '3', count it.
            let   r   =   check(   n   )   ?   1   :   0   ;

            // Recursively explore appending '7'.
            r   +=   dfs(   Number(   n   +   '7'   )   )   ;

            // Recursively explore appending '5'.
            r   +=   dfs(   Number(   n   +   '5'   )   )   ;

            // Recursively explore appending '3'.
            r   +=   dfs(   Number(   n   +   '3'   )   )   ;

            // Return the total count from this branch.
            return   r   ;

        }   else   {
            // If the current number exceeds the input limit, stop this branch.
            return   0   ;
        }
    } ;

    // Start the DFS from an empty string and print the final count.
    console.log(   dfs(   ''   )   )   ;
}

// Read input from standard input and pass it to the main function.
main(   require(   'fs'   ).readFileSync(   '/dev/stdin'   ,   'utf8'   )   )   ;