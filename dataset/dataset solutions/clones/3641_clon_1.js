var toInt = x => parseInt( x , 10 ) ; // Converts a string value to an integer.

var toIntArr = arr => arr . map ( x => toInt ( x ) ) ; // Transforms an array of strings to an array of integers.

var abs = x => x > 0 ? x : - x ; // Returns the absolute value of the input number.


function min ( ) { // This function finds the minimum value among the arguments provided.
    var rest = arguments ,
        val  = rest [ 0 ] ;

    for ( var i = 1 ; i < rest . length ; i ++ ) {
        if ( rest [ i ] < val ) {
            val = rest [ i ] ;
        }
    }

    return val ;
}


function max ( ) { // This function finds the maximum value among the arguments provided.
    var rest = arguments ,
        val  = rest [ 0 ] ;

    for ( var i = 1 ; i < rest . length ; i ++ ) {
        if ( rest [ i ] > val ) {
            val = rest [ i ] ;
        }
    }

    return val ;
}


// Entry point of the program. Reads input from standard input and processes it.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


function Main ( input ) {
    // Split the entire input string by newline characters into an array of lines.
    var input = input . split ( '\n' ) ;

    // Parse the first line to get problem parameters 'd' and 'g'.
    var dg = input [ 0 ] . split ( ' ' ) ;
    var d  = toInt ( dg [ 0 ] ) ;
    var g  = toInt ( dg [ 1 ] ) / 100 ; // 'g' is a target score, adjusted by dividing by 100.

    // Initialize an array to store problem component information.
    var pcais = [ ] ;
    var temp ; // Temporary variable, declared in original but not used in the final logic.

    // Initialize variables for tracking the answer and current score.
    var ans   = 0 ;
    var score = 0 ;

    // Loop through the remaining input lines to populate the 'pcais' array.
    for ( var i = 0 ; i < d ; i ++ ) {
        pcais [ i ]     = toIntArr ( input [ i + 1 ] . split ( ' ' ) ) ; // Convert line to array of integers.
        pcais [ i ] [ 1 ] /= 100 ; // Adjust a specific component value by dividing by 100.
        pcais [ i ] [ 2 ] = i + 1 + pcais [ i ] [ 1 ] / pcais [ i ] [ 0 ] ; // Calculate a sorting key.
        pcais [ i ] [ 3 ] = i + 1 ; // Store original index + 1 as another component.
    }

    // Sort the 'pcais' array based on the calculated key (index 2) in descending order.
    pcais . sort ( function ( a , b ) {
        return b [ 2 ] - a [ 2 ] ;
    } ) ;

    // Declare variables for internal loop operations.
    var x ;
    var y ;
    var z ; // This variable was declared in the original, but not explicitly used.
    var w ; // This variable was also declared in the original, but not explicitly used.

    // Main problem-solving loop. Continues until a solution is found.
    while ( true ) {
        x = - 1 ; // Initialize 'x' to an indicator value, typically meaning no solution found yet.

        // Iterate through the available problem components.
        for ( var i = 0 ; i < pcais . length ; i ++ ) {
            // Check if completing this component fully or partially meets the target 'g'.
            if ( score + pcais [ i ] [ 0 ] * pcais [ i ] [ 3 ] >= g ) {
                // Calculate the minimum number of problems 'y' needed from this component.
                y = Math . ceil ( ( g - score ) / pcais [ i ] [ 3 ] ) ;

                // Update 'x' if 'y' is a better (smaller) solution, or if 'x' hasn't been set yet.
                if ( x === - 1 || x > y ) {
                    x = y ;
                }
            } else if ( score + pcais [ i ] [ 0 ] * pcais [ i ] [ 3 ] + pcais [ i ] [ 1 ] >= g ) {
                // If completing the component with its bonus meets the target.
                y = pcais [ i ] [ 0 ] ; // Take all problems from this component.

                // Update 'x' if 'y' is a better (smaller) solution, or if 'x' hasn't been set yet.
                if ( x === - 1 || x > y ) {
                    x = y ;
                }
            }
        }

        // If a valid 'x' (solution) was found in the current iteration.
        if ( x !== - 1 ) {
            console . log ( ans + x ) ; // Output the total answer (accumulated + current best).
            return 0 ; // Terminate the program successfully.
        }

        // If no direct solution found in the current 'pcais' set,
        // take the best available component (which is at index 0 after sorting).
        ans   += pcais [ 0 ] [ 0 ] ; // Add the number of problems from this component to the total answer.
        score += pcais [ 0 ] [ 0 ] * pcais [ 0 ] [ 3 ] + pcais [ 0 ] [ 1 ] ; // Update the score.
        pcais . shift ( ) ; // Remove the used component from the array for the next iteration.
    }
}