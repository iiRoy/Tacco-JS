function getLines ( input ) { /* This function takes a multi-line string input */
    return input . split ( "\n" ) . map ( ( s ) => s . trim ( ) ) ; // It splits the string by newlines and trims whitespace from each resulting line.
}

function parseLine ( line ) {
    return line . split ( " " ) . map ( ( s ) => s . trim ( ) ) ; // This function splits a single line by spaces and trims each segment.
}

function parseLineToInt ( line ) { /* Parses a line of space-separated numbers into an array of integers */
    return line . split ( " " ) . map ( ( s ) => parseInt ( s . trim ( ) ) ) ; // Each segment is trimmed and then converted to an integer.
}

/*
 * The Main function is the primary entry point for processing the input.
 * It takes the entire input data as a single string.
 */
function Main ( input ) {

    // First, process the raw input string: split into lines, then parse each line into an array of integers.
    input = getLines ( input ) . map ( parseLineToInt ) ;

    // Extracting problem parameters from the first line of the input.
    // X and Y represent counts, while A, B, C are 0-indexed positions after adjustment.
    var X = input [ 0 ] [ 0 ] ;
    var Y = input [ 0 ] [ 1 ] ;
    var A = input [ 0 ] [ 2 ] - 1 ; // Adjusting to 0-based index
    var B = input [ 0 ] [ 3 ] - 1 ; // Adjusting to 0-based index
    var C = input [ 0 ] [ 4 ] - 1 ; // Adjusting to 0-based index

    // Retrieve the three arrays (p, q, r) from the subsequent lines of the input.
    var p = input [ 1 ] ;
    var q = input [ 2 ] ;
    var r = input [ 3 ] ;

    // Sort array 'p' in ascending numerical order.
    p . sort ( function ( a , b ) {
        if ( a > b ) {
            return 1 ;
        }
        if ( b > a ) {
            return -1 ;
        }
        return 0 ; // Elements are considered equal
    } ) ;

    // Sort array 'q' in ascending numerical order.
    q . sort ( function ( a , b ) {
        if ( a > b ) {
            return 1 ;
        }
        if ( b > a ) {
            return -1 ;
        }
        return 0 ;
    } ) ;

    // Sort array 'r' in ascending numerical order.
    r . sort ( function ( a , b ) {
        if ( a > b ) {
            return 1 ;
        }
        if ( b > a ) {
            return -1 ;
        }
        return 0 ;
    } ) ;

    // Initialize the variable to store the final answer (sum).
    var ans = 0 ;

    // Add the largest X elements from array 'p' to 'ans'.
    // These are located at indices A, A-1, ..., A-X+1.
    for ( var i = 0 ; i < X ; i ++ ) {
        ans += p [ A - i ] ;
    }

    // Determine the effective starting index for array 'p' for later comparisons.
    var pa = A - X + 1 ;

    // Add the largest Y elements from array 'q' to 'ans'.
    // These are located at indices B, B-1, ..., B-Y+1.
    for ( var j = 0 ; j < Y ; j ++ ) {
        ans += q [ B - j ] ;
    }

    // Determine the effective starting index for array 'q' for later comparisons.
    var pb = B - Y + 1 ;

    // Iterate through array 'r' from its largest element (index C) downwards.
    // This loop attempts to replace smaller elements from 'p' or 'q' with larger elements from 'r'.
    for ( var i = C ; i >= 0 ; i -- ) {

        // If both 'pa' and 'pb' have moved beyond their initial bounds,
        // it means all selected elements from p and q have been processed or replaced.
        if ( pa > A && pb > B ) {
            break ; // Exit the loop as no more replacements are possible.
        }

        // Case: All elements from 'p' that were initially selected have been considered for replacement.
        if ( pa > A ) {
            // If the current element from 'r' is greater than the current element from 'q',
            // replace q[pb] with r[i] to maximize the sum.
            if ( r [ i ] > q [ pb ] ) {
                ans = ans + r [ i ] - q [ pb ] ; // Update the sum
                pb ++ ; // Move to the next element in 'q' (smaller one)
                continue ; // Continue to the next iteration
            } else {
                break ; // No further improvement possible with r[i] or smaller r elements.
            }
        }

        // Case: All elements from 'q' that were initially selected have been considered for replacement.
        if ( pb > B ) {
            // If the current element from 'r' is greater than the current element from 'p',
            // replace p[pa] with r[i].
            if ( r [ i ] > p [ pa ] ) {
                ans = ans + r [ i ] - p [ pa ] ; // Update the sum
                pa ++ ; // Move to the next element in 'p' (smaller one)
                continue ; // Continue to the next iteration
            } else {
                break ; // No further improvement possible.
            }
        }

        // General Case: Both 'p' and 'q' still have elements that can potentially be replaced.
        // Check if r[i] is greater than the minimum of the current elements from p and q.
        if ( r [ i ] > Math . min ( p [ pa ] , q [ pb ] ) ) {
            // If q[pb] is greater than p[pa], it means p[pa] is the smaller of the two.
            // Replace p[pa] with r[i] for maximum gain.
            if ( q [ pb ] > p [ pa ] ) {
                ans = ans + r [ i ] - p [ pa ] ; // Update sum
                pa ++ ; // Advance 'pa' to consider the next smallest element from 'p'
            } else {
                // Otherwise, q[pb] is smaller or equal to p[pa].
                // Replace q[pb] with r[i].
                ans = ans + r [ i ] - q [ pb ] ; // Update sum
                pb ++ ; // Advance 'pb' to consider the next smallest element from 'q'
            }
        } else {
            // If r[i] is not greater than the minimum of p[pa] and q[pb],
            // then no further elements from 'r' (which are smaller) can improve the sum.
            break ; // Exit the loop.
        }
    }

    // Print the final calculated answer to the console.
    console . log ( ans ) ;
}

// These lines handle the input reading mechanism.
// They are part of the execution environment and should not be altered.
// Main ( require ( "fs" ) . readFileSync ( __dirname + '/in.txt' , "utf8" ) ) ; // For local testing with a file 'in.txt'
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ; // Standard input for typical online judges