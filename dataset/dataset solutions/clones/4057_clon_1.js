// This comment is modified to be more descriptive. It indicates that the entire input data is passed to this function.
function Main ( input ) {

    // Split the input string into an array of lines.
    var line = input . split ( "\n" ) ;

    // Parse the first line to get N and M values.
    var tmp = line [ 0 ] . split ( " " ) ;

    var N = Number ( tmp [ 0 ] ) ; // Represents the number of elements.
    var M = Number ( tmp [ 1 ] ) ; // Represents the number of constraints.

    // Initialize arrays to store the L, R, and D components of each constraint.
    var L = [ ] ;
    var R = [ ] ;
    var D = [ ] ;

    // Loop through the constraint lines, starting from the second line of input data.
    for ( var i = 1 ; i <= M ; i ++ ) {
        // Split each constraint line by space to get its individual components.
        var tmp = line [ i ] . split ( " " ) ;

        // Convert string components to numbers and add them to their respective arrays.
        L . push ( Number ( tmp [ 0 ] ) ) ;
        R . push ( Number ( tmp [ 1 ] ) ) ;
        D . push ( Number ( tmp [ 2 ] ) ) ;

        // Immediate consistency check: if L[j] and R[j] refer to the same element,
        // it means their difference D[j] must be zero. If not, it's impossible.
        if ( Number ( tmp [ 0 ] ) === Number ( tmp [ 1 ] ) ) {
            console . log ( 'No' ) ; // Output 'No' if a contradiction is found.
            return false ; // Terminate execution, as the problem has no solution.
        }
    }

    // Initialize an array `pos` to store the determined positions of elements.
    var pos = [ ] ;
    // `ans` will hold the final result ('Yes' or 'No').
    var ans ;
    // `max` keeps track of the largest position value assigned so far.
    var max = 1 ;

    // Label for the main loop, allowing for a targeted break.
    loopj :
    for ( var j = 0 ; j < M ; j ++ ) {

        // For the very first constraint (j=0), arbitrarily set the position of the
        // element L[0]-1 to 1. This serves as a reference point.
        if ( j === 0 ) {
            pos [ L [ j ] - 1 ] = 1 ;
        }

        // Calculate the expected position of R[j]-1 based on the position of L[j]-1
        // and the given difference D[j].
        var rightpos = pos [ L [ j ] - 1 ] + D [ j ] ;

        // Update the maximum position if the newly calculated `rightpos` is larger.
        if ( max <= rightpos ) {
            max = rightpos ;
        }

        // Check if the position of R[j]-1 has NOT been determined yet.
        if ( ! pos [ R [ j ] - 1 ] ) {
            // If it's not set, assign the `rightpos` to it.
            pos [ R [ j ] - 1 ] = rightpos ;
        } else {
            // If the position of R[j]-1 HAS been determined previously,
            // check if the newly calculated `rightpos` is consistent with the existing one.
            if ( pos [ R [ j ] - 1 ] !== rightpos ) {
                ans = 'No' ; // If inconsistent, set answer to 'No'.
                break loopj ; // Exit the loop immediately, as a contradiction is found.
            }
        }
    }

    // After processing all constraints, check if the maximum required position
    // (max - 1, since positions start from 1) exceeds a very large number (10^9 + 1).
    // This could indicate an overflow or an impossible scenario in competitive programming.
    if ( max - 1 > 1000000001 ) {
        ans = 'No' ;
    }

    // If no contradictions were found throughout the process, the answer is 'Yes'.
    if ( ! ans ) {
        ans = 'Yes' ;
    }

    // Output the final determined answer.
    console . log ( ans ) ;
}

// This section handles standard input/output and should not be modified.
// It reads the entire content from stdin and passes it to the Main function for processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;