/*
 * This JavaScript file implements a recursive algorithm
 * to solve a specific problem, likely related to
 * counting elements in a fractal-like structure.
 *
 * It uses strict mode to ensure cleaner code and prevent common errors.
 * All functions are defined globally for simplicity in this context.
 */
"use strict" ; // Enforces stricter parsing and error handling in the code.

// The primary function that orchestrates the program's execution.
function main ( arg )
{
        // Split the input string into an array of lines based on newline characters.
    const   inputs   =   arg.split( "\n" ) ;

    // Parse the first number from the first line of input and assign it to N.
    const N = parseInt( inputs[0] . split( " " ) [0] ) ;
    // Parse the second number from the first line of input and assign it to X.
    const X = parseInt( inputs[0] . split( " " ) [1] ) ;

    // Call the core 'func' function with N and X, then print the result to the console.
    console . log( func( N , X ) ) ;
}


// Helper function to calculate a value named 'all' based on the given 'level'.
// This value typically represents the total count of some elements at a particular level.
function all ( level )
{
        return Math . pow( 2 , level + 2 ) - 3 ; // Uses Math.pow for exponential calculation.
}


// Another helper function, 'patty', which calculates a different value
// also dependent on the 'level'. This might represent a sub-component count.
function patty ( level )
{
    return Math . pow( 2 , level + 1 ) - 1 ; // Also involves an exponential calculation.
}


/**
 * This is the main recursive function that determines the final result.
 * It takes a 'level' and a target 'X' as input and navigates a structure
 * to find a specific count or position.
 *
 * @param {number} level - The current recursive depth or level.
 * @param {number} X     - The target value or index to locate.
 * @returns {number} The calculated count or position based on the given inputs.
 */
function func ( level , X )
{
    // Calculate the 'All' value for the previous level, used in subsequent checks.
    const All = all( level - 1 ) ;

    // Base case 1: If the level is 0, return 1.
    if ( level === 0 )
    {
        return 1 ;
    }
    // Base case 2: If X is less than or equal to 1, return 0.
    else if ( X <= 1 )
    {
        return 0 ;
    }
    // Recursive step 1: If X falls within the first segment of the current level.
    else if ( X <= All + 1 )
    {
        return func( level - 1 , X - 1 ) ; // Recurse with decremented level and X.
    }
    // Recursive step 2: If X falls into the second segment of the current level.
    else
    {
        // This involves summing the 'patty' count, a fixed value (1),
        // and a further recursive call with adjusted parameters.
        return patty( level - 1 ) + 1 + func( level - 1 , X - All - 2 ) ;
    }
}


// This line executes the 'main' function.
// It reads the entire content of '/dev/stdin' (standard input)
// as a UTF-8 string using Node.js's 'fs' module, and passes it to 'main'.
main( require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ) ;