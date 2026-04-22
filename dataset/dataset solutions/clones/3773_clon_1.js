/*
 * This file contains a collection of JavaScript utilities and a main program
 * designed to solve a specific problem involving color statistics and scores.
 *
 * It includes functions for object comparison, string to integer conversion,
 * and a recursive 'count' function. The main logic processes input data,
 * calculates color distribution, and determines a minimum score based on
 * color combinations.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */

/*
 * Compares two objects for shallow equality based on their own enumerable
 * property names.
 *
 * @param {object} a - The first object to compare.
 * @param {object} b - The second object to compare.
 * @returns {boolean} - True if the objects have identical properties and
 *                      corresponding values, false otherwise.
 */
function equal( a, b )
{
    // Retrieve property names for object 'a'
    var aP = Object.getOwnPropertyNames ( a ) ;

    // Retrieve property names for object 'b'
    var bP = Object.getOwnPropertyNames ( b ) ;


    // If the number of properties differs, objects are not equal.
    if ( aP . length != bP . length )
    {
        return false ;
    }

    // Iterate through properties of 'a' to compare values.
    for ( var i = 0 ; i < aP . length ; i ++ )
    {
        // If any property value is not strictly equal, objects are not equal.
        if ( a [ aP [ i ] ] !== b [ aP [ i ] ] )
        {
            return false ;
        }
    }

    // All properties and values match, so objects are considered equal.
    return true ;
}


/**
 * Parses a string and returns an integer.
 * This function is a wrapper around `parseInt` with a radix of 10.
 *
 * @param {string} text - The string to parse.
 * @returns {number} - The parsed integer.
 */
function pi( text )
{
    return parseInt ( text , 10 ) ;
}


// Array 'six' contains powers of 6, from 6^6 down to 6^1.
var six = [ 6 , 5 , 4 , 3 , 2 , 1 ] . map ( _ => Math . pow ( 6 , _ ) ) ;
// Array 'nine' contains powers of 9, from 9^5 down to 9^1.
var nine = [ 5 , 4 , 3 , 2 , 1 ] . map ( _ => Math . pow ( 9 , _ ) ) ;


/*
 * Recursive function to count something based on the input 'i'.
 * The exact logic depends on the values of 'six' and 'nine' arrays.
 *
 * @param {number} i - The input number.
 * @returns {number} - The calculated count.
 */
function count( i )
{
    // Base case 1: if i is less than 6, return i itself.
    if ( i < 6 )
    {
        return i ;
    }

    // Base case 2: if i is less than 9, return 1 plus the difference from 6.
    if ( i < 9 )
    {
        return 1 + ( i - 6 ) ;
    }

    // Recursive step: calculate the minimum of two paths.
    // Path 1: using an element from 'six' array.
    // Path 2: using an element from 'nine' array.
    return Math . min (
                         count ( i - six . find ( _ => _ <= i ) ) + 1 ,
                         count ( i - nine . find ( _ => _ <= i ) ) + 1
                       ) ;
}


/*
 * Main function to process input data, calculate color statistics,
 * and determine a minimum score based on specific rules.
 *
 * @param {string} input - The raw input string, typically from stdin.
 */
function main( input )
{
    // Split the input string into lines.
    var l = input . split ( "\n" ) ;

    // Extract N (grid size) and C (number of colors) from the first line.
    // Use destructuring assignment and map to parse integers.
    var [ N , C ] = l . shift ( ) . split ( " " ) . map ( _ => pi ( _ ) ) ;

    // Extract D (dissatisfaction matrix) from subsequent C lines.
    // Each line is split by space and parsed into integers.
    var D = l . splice ( 0 , C ) . map ( _ => _ . split ( " " ) . map ( _ => pi ( _ ) ) ) ;

    // Extract c (color grid) from the next N lines.
    // Each line represents a row of colors, split by space and parsed.
    var c = l . splice ( 0 , N ) . map ( _ => _ . split ( " " ) . map ( _ => pi ( _ ) ) ) ;

    // Initialize 'mod2colorStat' to store counts of colors based on (i+j)%3.
    // It's a 2D array: 3 rows (for mod 0, 1, 2) and C columns (for each color).
    var mod2colorStat = [
                            ".".repeat(C).split("").map(_ => 0),
                            ".".repeat(C).split("").map(_ => 0),
                            ".".repeat(C).split("").map(_ => 0)
                        ] ;

    // Iterate through the color grid 'c' to populate 'mod2colorStat'.
    // For each cell (i, j) with color `_`, increment the count for that color
    // in the corresponding (i+j)%3 category.
    c . forEach ( ( _ , i ) => _ . forEach ( ( _ , j ) => {
        mod2colorStat [ ( i + j ) % 3 ] [ _ - 1 ] ++ ;
    } ) ) ;

    // Calculate 'mod2score': the dissatisfaction score for each color
    // if it were assigned to a specific (i+j)%3 category.
    var mod2score = mod2colorStat . map ( stat => {
        // Log an intermediate calculation for debugging.
        console . log (
                          ".".repeat(C).split("").map (
                                                          ( _ , toColor ) => stat . map (
                                                                                              ( count , fromColor ) => fromColor == toColor ? 0 : count * D [ fromColor ] [ toColor ]
                                                                                         )
                                                      )
                      ) ;

        // For each 'stat' (color counts for a mod category),
        // calculate the total dissatisfaction if each target color 'toColor'
        // were assigned to this category.
        return ".".repeat(C).split("").map ( ( _ , toColor ) =>
            stat . map ( ( count , fromColor ) =>
                // If fromColor is the same as toColor, dissatisfaction is 0.
                // Otherwise, it's count * D[fromColor][toColor].
                fromColor == toColor ? 0 : count * D [ fromColor ] [ toColor ]
            ) . reduce ( ( a , b ) => a + b , 0 ) // Sum up all dissatisfactions.
        ) ;
    } ) ;

    // Initialize 'minScore' to a very large value.
    var minScore = Infinity ;

    // Iterate through all possible combinations of three distinct colors (a, b, c)
    // for the three (i+j)%3 categories.
    for ( let a = 0 ; a < C ; a ++ )
    {
        for ( let b = 0 ; b < C ; b ++ )
        {
            // The colors for mod 0 and mod 1 categories must be different.
            if ( a == b )
            {
                continue ; // Skip if colors 'a' and 'b' are the same.
            }

            for ( let c = 0 ; c < C ; c ++ )
            {
                // The color for mod 2 category must be different from mod 0 and mod 1.
                if ( b == c || a == c )
                {
                    continue ; // Skip if color 'c' is the same as 'a' or 'b'.
                }

                // Calculate the current total score for the combination (a, b, c).
                const currentTotalScore = mod2score [ 0 ] [ a ] + mod2score [ 1 ] [ b ] + mod2score [ 2 ] [ c ] ;

                // If the current score is not better than or equal to the minimum,
                // log the combination (for debugging or specific problem requirement).
                if ( minScore <= currentTotalScore )
                {
                    console . log ( a , b , c ) ;
                }

                // Update 'minScore' if the current combination yields a lower total score.
                minScore = Math . min ( minScore , currentTotalScore ) ;
            }
        }
    }

    // Log the input, calculated statistics, and the final minimum score.
    console . log ( input , mod2colorStat , mod2score , minScore ) ;
}


// Read input from standard input synchronously using Node.js 'fs' module.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;