/*
 * This JavaScript program determines a specific condition based on two input numbers.
 * It reads input from standard I/O, performs calculations, and prints a 'Yes' or 'No' answer.
 */

// Import the Node.js 'fs' (file system) module to read input data.
const   input   =   require ( 'fs' )
    .   readFileSync ( '/dev/stdin' ,   'utf-8'   )
    .   split ( '\n' ) ; // Read the entire file, then split it into an array of lines.

// The first line of input contains two space-separated numbers.
// Destructure these into variables X and Y after converting them to numerical types.
const   [   X   ,   Y   ]   =   input [   0   ]
    .   split (   ' '   ) // Split the first line by space.
    .   map (   Number   ) ; // Convert each part to a number.

// Initialize the answer string. By default, it's 'No'.
let   ans   =   'No'   ;

// Begin conditional logic: The main calculation only proceeds if X is strictly less than Y.
if   (   X   <   Y   )
{
    // Calculate an intermediate value 'r'.
    // This calculation is crucial for determining the final answer.
    const   r   =   (   Y   -   X   *   2   )   /   2   ;

    // If the calculated 'r' is less than or equal to X, then the condition is met.
    if   (   r   <=   X   )
    {
        // Update the answer to 'Yes' if the condition holds true.
        ans   =   'Yes'   ;
    }
}

// Output the final determined answer to the console.
console . log (   ans   ) ;

// End of program execution.
// This script addresses a common type of competitive programming problem.