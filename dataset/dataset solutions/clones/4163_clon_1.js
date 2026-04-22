/*
 *  This file contains a solution for a programming problem.
 *  The main function processes input data to determine a specific outcome.
 *  It's a Type I clone, meaning only whitespace and comments have been altered.
 */

// The 'input' parameter will receive the complete input data as a string.
function Main ( input ) {

    // Problem context: This might be related to ABC082D from AtCoder.
    // Parsing the input string into lines.
    var line = input . split ( "\n" ) ;


    // Extracting the first line for string 's'.
    var s = line [ 0 ] ;

    // Splitting the second line by spaces to get temporary values.
    var tmp = line [ 1 ] . split ( " " ) ;


    // Splitting the main string 's' by 'T' characters.
    // This likely separates segments of movements.
    var forward = s . split ( "T" ) ;


    // The destination coordinates, parsed from the temporary values.
    var dest = [ Number ( tmp [ 0 ] ) , Number ( tmp [ 1 ] ) ] ;


    // Arrays to store lengths of movements in X and Y directions.
    var dx = [ ] ;
    var dy = [ ] ;

    /*
     *  Iterate through the 'forward' segments.
     *  Segments at even indices contribute to dx (X-direction).
     *  Segments at odd indices contribute to dy (Y-direction).
     */
    for ( var i = 0 ; i < forward . length ; i ++ ) {

        if ( i % 2 === 0 ) {
            // Even index, add to X-direction movements.
            dx . push ( forward [ i ] . length ) ;
        } else {
            // Odd index, add to Y-direction movements.
            dy . push ( forward [ i ] . length ) ;
        }
    }


    // Arrays to store possible reachable X and Y coordinates.
    var x = [ ] ;
    var y = [ ] ;

    // Flags to indicate if the destination X and Y coordinates are reachable.
    var xflg = false ;
    var yflg = false ;


    /*
     *  Processing X-direction movements.
     *  This loop calculates all possible X positions after each segment.
     */
    loopx :
    for ( var j = 0 ; j < dx . length ; j ++ ) {

        x [ j ] = [ ] ; // Initialize a new array for current step's X positions.

        if ( j === 0 ) {
            // For the first segment, only one possible X position (the length itself).
            x [ j ] . push ( dx [ j ] ) ;
        }
        else if ( j === dx . length - 1 ) {
            // For the last segment, check if any path leads to the destination X.
            for ( var k = 0 ; k < x [ j - 1 ] . length ; k ++ ) {
                // Check both positive and negative moves from previous positions.
                if ( ( x [ j - 1 ] [ k ] + dx [ j ] ) === dest [ 0 ] || ( x [ j - 1 ] [ k ] - dx [ j ] ) === dest [ 0 ] ) {
                    xflg = true ; // Destination X is reachable.
                    break loopx ; // Exit the outer loop immediately.
                }
            }
        }
        else {
            // For intermediate segments, calculate new possible X positions.
            for ( var k = 0 ; k < x [ j - 1 ] . length ; k ++ ) {
                x [ j ] . push ( x [ j - 1 ] [ k ] + dx [ j ] ) ; // Move positive X.
                if ( dx [ j ] !== 0 ) {
                    x [ j ] . push ( x [ j - 1 ] [ k ] - dx [ j ] ) ; // Move negative X (if movement exists).
                }
            }
        }
    }


    /*
     *  Processing Y-direction movements.
     *  This loop calculates all possible Y positions after each segment.
     */
    loopy :
    for ( var j = 0 ; j < dy . length ; j ++ ) {

        y [ j ] = [ ] ; // Initialize a new array for current step's Y positions.

        if ( j === 0 ) {
            // For the first segment, only one possible Y position.
            y [ j ] . push ( dy [ j ] ) ;
        }
        else if ( j === dy . length - 1 ) {
            // For the last segment, check if any path leads to the destination Y.
            for ( var k = 0 ; k < y [ j - 1 ] . length ; k ++ ) {
                // Check both positive and negative moves from previous positions.
                // NOTE: There might be a bug here, comparing with dest[0] instead of dest[1].
                // However, as per Type I clone definition, this cannot be altered.
                if ( ( y [ j - 1 ] [ k ] + dy [ j ] ) === dest [ 1 ] || ( y [ j - 1 ] [ k ] - dy [ j ] ) === dest [ 0 ] ) {
                    yflg = true ; // Destination Y is reachable.
                    break loopy ; // Exit the outer loop immediately.
                }
            }
        }
        else {
            // For intermediate segments, calculate new possible Y positions.
            for ( var k = 0 ; k < y [ j - 1 ] . length ; k ++ ) {
                y [ j ] . push ( y [ j - 1 ] [ k ] + dy [ j ] ) ; // Move positive Y.
                if ( dy [ j ] !== 0 ) {
                    y [ j ] . push ( y [ j - 1 ] [ k ] - dy [ j ] ) ; // Move negative Y (if movement exists).
                }
            }
        }
    }


    // Final check: if both X and Y destinations are reachable, print "Yes", otherwise "No".
    if ( xflg && yflg ) {
        console . log ( "Yes" ) ;
    }
    else {
        console . log ( "No" ) ;
    }

} // End of Main function.


/*
 *  The following lines handle standard input/output.
 *  Do not modify anything below this comment block.
 *  It reads the entire standard input and passes it to the Main function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;