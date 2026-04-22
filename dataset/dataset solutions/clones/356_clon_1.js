/*
 * This JavaScript code processes input data to solve a problem.
 * It appears to be calculating the largest rectangle of '1's in a 2D binary matrix,
 * where '1's are derived from '.' characters in the input.
 * The input is read from standard input.
 */

var input = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ;


// The input string is trimmed and then split into an array of lines.
var arr = input . trim() . split( "\n" ) ;

// The main processing loop continues until a specific termination condition is met.
while ( true )
{
    // Extract the height (h) and width (w) from the first line of the current problem set.
    // The line is shifted from the array, split by space, and then each part converted to a Number.
    var hw = arr . shift() . split( " " ) . map( Number ) ;

    // Check for the termination condition: "0 0".
    if ( hw . join( " " ) == "0 0" )
    {
        break ; // Exit the loop if the termination condition is met.
    }

    // Assign the extracted height and width to individual variables for clarity.
    var h = hw[0] ;
    var w = hw[1] ;

    // Initialize a 2D array (yx) to store processed data.
    // This array will hold the heights of consecutive '.' characters (or '1's).
    var yx = [] ;

    // Loop through each row of the input grid.
    for ( var y = 0 ; y < h ; y++ )
    {
        // Get the current row's character array from the input.
        var ary = arr . shift() . split( "" ) ;

        // Initialize the inner array for the current row.
        yx[y] = [] ;

        // Iterate over each character in the current row.
        ary . forEach( function ( v , x )
        {
            // If it's the first row (y == 0):
            if ( y == 0 && v == "." )
            {
                // A '.' means a '1' in the binary matrix.
                yx[y][x] = 1 ;
            }
            else if ( y == 0 && v != "." )
            {
                // Any other character means a '0'.
                yx[y][x] = 0 ;
            }
            // If it's not the first row (y != 0):
            else if ( y != 0 && v == "." )
            {
                // If it's a '.', its height is the height of the cell above it plus 1.
                yx[y][x] = yx[y-1][x] + 1 ;
            }
            else if ( y != 0 && v != "." )
            {
                // If it's not a '.', its height is 0.
                yx[y][x] = 0 ;
            }
        } ) ; // End of forEach for row characters.
    } // End of for loop for rows.

    // Initialize 'max' to store the maximum area found so far.
    var max = 0 ;

    // This section implements the "largest rectangle in histogram" algorithm for each row.
    // It iterates through each row (k) of the processed `yx` array.
    for ( var k = 0 ; k < h ; k++ )
    {
        // 's' is a stack used to keep track of increasing heights.
        var s = [] ;

        // A '0' is appended to the end of each row histogram to ensure all elements in the stack are processed.
        yx[k][w] = 0 ;

        // Iterate through each element (height) in the current row's histogram.
        for ( var x = 0 ; x <= w ; x++ )
        {
            var v = yx[k][x] ; // Current height.

            // If the stack is empty, push the current height and its index.
            if ( s . length == 0 )
            {
                s . push( [ v , x + 1 ] ) ;
                continue ;
            }

            // If the current height is greater than the top of the stack, push it.
            if ( s[s . length - 1][0] < v )
            {
                s . push( [ v , x ] ) ;
            }
            // If the current height is equal to the top of the stack, do nothing (skip).
            else if ( s[s . length - 1][0] == v )
            {
                continue ;
            }
            // If the current height is less than the top of the stack, pop elements from the stack.
            else if ( s[s . length - 1][0] > v )
            {
                while ( s . length != 0 )
                {
                    var r = s . pop() ; // Pop an element (height and its original index).

                    // If the current height is greater than the popped height, push the popped element back and break.
                    if ( v > r[0] )
                    {
                        s . push( r ) ;
                        break ;
                    }
                    // If the current height is equal to the popped height, break.
                    else if ( v == r[0] )
                    {
                        break ;
                    }
                    // If the current height is less than the popped height, calculate the area.
                    else if ( v < r[0] )
                    {
                        // Calculate area: popped height * (current index - popped element's original index).
                        max = Math . max( max , r[0] * ( ( x + 1 ) - r[1] ) ) ;
                    }
                } // End of while loop for stack processing.
            }
        } // End of inner for loop for histogram elements.
    } // End of outer for loop for rows.

    // Print the maximum area found for the current problem set.
    console . log( max ) ;
} // End of while (true) loop.