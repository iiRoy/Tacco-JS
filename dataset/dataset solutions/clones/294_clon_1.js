/*
 * This file contains a JavaScript implementation of a dynamic programming-like
 * algorithm, likely for finding a maximum sum path in a triangular or
 * pyramid-like structure represented by the 'yx' array.
 *
 * The primary function, 'bomb', performs a recursive traversal.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 *
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 * The core logic, variable names, function names, and expressions remain identical.
 */

//  Definition of the recursive 'bomb' function.
//  It takes current row 'y', current column 'x', and the accumulated 'sum'
//  up to this point in the path.
function bomb ( y , x , sum )
{

    // Store the current accumulated sum in the tracking array YX for memoization
    // or to keep track of visited paths.
    YX [ y ][ x ] = sum ;


    // Base case: If we have reached the last row of the 'yx' structure.
    if ( y == yx . length - 1 )
    {
        // Update the global maximum sum if the current path's sum is greater.
        max = Math . max ( max , sum ) ;
    }


    // Recursive step 1: If we are in the upper half of the structure (excluding the last row).
    else if ( ( yx . length - 1 ) / 2 > y )
    {

        // Explore the path to the element directly below (y+1, x).
        // Only proceed if the new sum is greater than what's currently recorded in YX.
        if ( YX [ y + 1 ] [ x ] < sum + yx [ y + 1 ] [ x ] )
        {
            bomb ( y + 1 , x , sum + yx [ y + 1 ] [ x ] ) ;
        }


        // Explore the path to the element diagonally below and to the right (y+1, x+1).
        // Again, only if it leads to a potentially higher sum.
        if ( YX [ y + 1 ] [ x + 1 ] < sum + yx [ y + 1 ] [ x + 1 ] )
        {
            bomb ( y + 1 , x + 1 , sum + yx [ y + 1 ] [ x + 1 ] ) ;
        }
    }

    // Recursive step 2: If we are in the lower half of the structure (including the middle row).
    else if ( ( yx . length - 1 ) / 2 <= y )
    {

        // Check for the path to the element diagonally below and to the left (y+1, x-1).
        // Ensure the column index x-1 is valid (not negative).
        if ( x - 1 >= 0 )
        {
            // Proceed if the new sum is greater.
            if ( ( YX [ y + 1 ] [ x - 1 ] < sum + yx [ y + 1 ] [ x - 1 ] ) )
            {
                bomb ( y + 1 , x - 1 , sum + yx [ y + 1 ] [ x - 1 ] ) ;
            }
        }


        // Check for the path to the element directly below (y+1, x).
        // Ensure the column index x is within the bounds of the next row.
        if ( x < yx [ y ] . length - 1 )
        {
            // Proceed if the new sum is greater.
            if ( ( YX [ y + 1 ] [ x ] < sum + yx [ y + 1 ] [ x ] ) )
            {
                bomb ( y + 1 , x , sum + yx [ y + 1 ] [ x ] ) ;
            }
        }
    }
}


// Read input from standard input.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Trim whitespace from the input and split it into an array of lines.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;


// Initialize two arrays:
// 'yx' will store the input number structure.
var yx = [ ] ;

// 'YX' will store intermediate sums or visited states (initialized to zeros).
var YX = [ ] ;


// Process each line from the input.
Arr . forEach ( function ( v )
{

    // Split the line by commas and convert each part to a Number.
    // This forms a row of the 'yx' structure.
    var x = v . split ( "," ) . map ( Number ) ;


    // Create a corresponding row for 'YX', initialized with zeros.
    var X = x . map ( function ( v ) { return 0 ; } ) ;


    // Add the processed row to 'yx'.
    yx . push ( x ) ;


    // Add the initialized zero row to 'YX'.
    YX . push ( X ) ;
} ) ;


// Initialize the global maximum sum variable.
var max = 0 ;


// Start the recursive 'bomb' function from the top-most element (0,0)
// with its initial value as the starting sum.
bomb ( 0 , 0 , yx [ 0 ] [ 0 ] ) ;


// Print the final maximum sum found to the console.
console . log ( max ) ;