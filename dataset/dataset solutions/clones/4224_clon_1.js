/*
 * This JavaScript file contains the implementation of a number puzzle solver.
 * It attempts to insert '+' or '-' operators between digits to achieve a target sum.
 */
function     Main(   input   )
{
    // The input string is split into an array of individual characters (digits).
    var inputs  =  input.split("");

    // An array to store the operators ('+' or '-') determined by the Func function.
    var a = [ ];

    /*
     * Func is a recursive helper function that tries to find a combination of operators.
     * @param {number} n The current index (remaining digits to process).
     * @param {number} sum The current accumulated sum.
     * @returns {boolean} True if a valid combination is found, false otherwise.
     */
    function Func(n,    sum   )
    {
        // Base case: If no more digits are left to process (n is 0).
        if(    n == 0    )
        {
            // If the final sum is 0, a valid combination was found.
            if(   sum == 0   )
            {
                return true; /* Success! */
            }
        }
        else
        {
            // Recursive step: Try placing a '-' operator.
            // Note: `new Number()` is used for explicit type conversion from string to number.
            if(   Func(   n-1,   sum + new Number(inputs[n-1])   ) == true   )
            {
                // If the recursive call returns true, this path leads to a solution.
                a[n-1]   =   "-"; /* Mark this position with a minus sign. */
                return true; // Propagate success upwards.
            }
            // Else, if the '-' path didn't work, try placing a '+' operator.
            else if(   Func(   n-1,   sum - new Number(inputs[n-1])   ) == true   )
            {
                a[n-1]   =   "+"; /* Mark this position with a plus sign. */
                return true; // Propagate success upwards.
            }
            else
            {
                // If neither '+' nor '-' leads to a solution from this point,
                // then this path is not viable.
                return false; /* No solution found down this path. */
            }
        }
    }

    // Call the Func function to attempt to solve the puzzle.
    // The puzzle involves 4 digits (indices 0 to 3) and a target sum of 7.
    if(   Func(   4,   7   ) == true   )
    {
        // If a solution is found, print the expression.
        console.log(   inputs[0]   +   a[1]   +   inputs[1]   +   a[2]   +   inputs[2]   +   a[3]   +   inputs[3]   +   "=7"   ); /* Output the result. */
    }
    else
    {
        // If no solution is found (which should not happen for the specific problem this code solves).
        console.log(   "program error"   ); /* Indicate an unexpected error. */
    }
}
/*
 * The main entry point of the script.
 * It reads input from standard input, typically for competitive programming environments.
 */
Main(   require(   'fs'   )   .   readFileSync(   '/dev/stdin',   'utf8'   )   ); // Execute the Main function with input.