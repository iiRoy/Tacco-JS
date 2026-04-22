function main ( input ) /* This is the main function that processes the given input string. */ {

    var lines = input.split( '\n' ) ; // Split the input string by newline characters into an array of lines.

    var lines0 = lines[0].split( ' ' ) ; // Take the first line and split it by spaces.

    var N = parseInt( lines0[0], 10 ) ; // Parse the first element of lines0 as an integer for N.
    var M = parseInt( lines0[1], 10 ) ; // Parse the second element of lines0 as an integer for M.

    var P = lines[1].split( ' ' ) ; // Take the second line and split it by spaces to get array P.

    // Convert all elements of P from strings to integers.
    for ( i = 0 ; i < P.length ; i++ ) {
        P[i] = parseInt( P[i], 10 ) ;
    }

    var a = [] ; // Initialize an empty array 'a'. This will store pairs of integers.

    // Populate array 'a' with M pairs from the subsequent lines of input.
    for ( i = 0 ; i < M ; i++ ) {
        a[i] = lines[i+2].split( ' ' ) ; // Each pair is read from a separate line, starting from the third line.
        a[i][0] = parseInt( a[i][0], 10 ) ; // Convert the first element of the pair to an integer.
        a[i][1] = parseInt( a[i][1], 10 ) ; // Convert the second element of the pair to an integer.
    }

    var count = 0 ; // Initialize a counter variable.

    // This is the primary loop that iterates N times.
    for ( i = 0 ; i < N ; i++ ) {

        var f = true ; // Flag variable to control the do-while loop.
        var lastc = [] ; // Array to store the previous state of 'c'.
        var c = [ i + 1 ] ; // Initialize 'c' with the current iteration number + 1.
        var c2 = [] ; // Temporary array for collecting new elements.
        var c3 = [ i + 1 ] ; // Another temporary array, acts as a visited set within the current iteration.
        var g = P[i] ; // Get the value 'g' from array P corresponding to the current iteration.

        // Begin a do-while loop that continues as long as 'f' is true.
        do {

            // Iterate through elements of 'c'.
            for ( k = 0 ; k < c.length ; k++ ) {

                // Iterate through elements of 'a'.
                for ( j = 0 ; j < M ; j++ ) {

                    // Check if the first element of a[j] matches the current c[k].
                    if ( a[j][0] === c[k] ) {
                        // If a[j][1] is not in 'c' and not in 'c3', add it to c2 and c3.
                        if ( c.indexOf( a[j][1] ) === -1 && c3.indexOf( a[j][1] ) === -1 ) {
                            c2.push( a[j][1] ) ;
                            c3.push( a[j][1] ) ;
                        }
                    } else if ( a[j][1] === c[k] ) { // Check if the second element of a[j] matches c[k].
                        // If a[j][0] is not in 'c' and not in 'c3', add it to c2 and c3.
                        if ( c.indexOf( a[j][0] ) === -1 && c3.indexOf( a[j][0] ) === -1 ) {
                            c2.push( a[j][0] ) ;
                            c3.push( a[j][0] ) ;
                        }
                    }

                    // If 'g' is found in 'c', break the inner loop.
                    if ( c.indexOf( g ) >= 0 ) {
                        break ;
                    }
                }
                // If 'g' is found in 'c', break the outer loop as well.
                if ( c.indexOf( g ) >= 0 ) {
                    break ;
                }
            }

            // After the inner loops, check for 'g' again.
            if ( c.indexOf( g ) >= 0 ) {
                count += 1 ; // Increment the counter if 'g' is found.
                f = false ; // Set flag to false to exit the do-while loop.
            }

            // Check if 'c' is the same as 'lastc'.
            if ( lastc === c ) {
                f = false ; // If they are identical, set flag to false to exit the loop.
            } else {
                var c3 = [] ; // Re-initialize c3 for the next iteration.
                // Populate c3 with elements from c2 that are not already in c.
                for ( k = 0 ; k < c2.length ; k++ ) {
                    if ( c.indexOf( c2[k] ) === -1 ) {
                        c3.push( c2[k] ) ;
                    }
                }
                c = c3 ; // Update 'c' with the newly found unique elements.
                // c = c2; // This line was commented out in the original code.
                lastc = c ; // Update 'lastc' to the current state of 'c'.
            }
            // console.log(c); // This line was commented out in the original code.

        } while ( f === true ) ; // Continue loop while 'f' is true.

    }

    console.log( count ) ; // Output the final count.

}

// Read input from stdin and pass it to the main function.
main( require( 'fs' ) . readFileSync( '/dev/stdin', 'utf8' ) ) ;