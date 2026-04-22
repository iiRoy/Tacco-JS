/*
 * Global variables declaration section.
 * These variables are used across multiple functions.
 */
var      n,      m;

// Arrays 'a' and 'b' are initialized as empty.
var a = [],        b = [];


/**
 * Performs a binary search-like operation on array 'b'.
 *
 * @param {number} x - The value to search for in array 'b'.
 * @returns {boolean} True if 'x' is found in 'b', false otherwise.
 */
function search ( x ) {

    /*
     * Initialize left and right pointers for the binary search.
     * 'l' is the lower bound, 'r' is the upper bound.
     */
    var l = 0,
        r = m;

    // Continue the search while there's a significant range to check.
    while ( r - l > 1 ) {

        // Calculate the middle index using bitwise right shift for efficiency.
        var c = (l + r) >> 1;

        // If the element at 'c' is less than or equal to 'x',
        // move the left pointer to 'c'.
        if ( b[c] <= x ) {
            l = c;
        }
        // Otherwise, move the right pointer to 'c'.
        else {
            r = c;
        }
    }

    // After the loop, 'l' points to the potential position of 'x'.
    // Check if the element at 'l' is exactly 'x'.
    return b[l] === x;

} // End of search function.


/*
 * The main execution logic of the program.
 * This function processes input, performs calculations, and outputs results.
 */
function main (  ) {

    // Loop continues as long as scan() returns a truthy value for 'n'.
    while ( n = scan ( ) ) {

        // Read the value for 'm'.
        m = scan ( );

        // Populate array 'a' with 'n' elements.
        rep ( n , function ( i ) {

            a[i] = scan ( );

        } );

        // Populate array 'b' with 'm' elements.
        rep ( m , function ( i ) {

            b[i] = scan ( );

        } );


        // Sort array 'a' in ascending order.
        a.sort ( function ( u , v ) {

            return u - v;

        } );

        // Sort array 'b' in ascending order.
        b.sort ( function ( u , v ) {

            return u - v;

        } );


        // Calculate the sum of elements in array 'a'.
        var s = 0;
        rep ( n , function ( i ) {

            s += a[i];

        } );

        // Calculate the sum of elements in array 'b'.
        var t = 0;
        rep ( m , function ( i ) {

            t += b[i];

        } );


        // Calculate the required difference 'd'.
        var d = Math.floor ( (t - s) / 2 );

        // If the total difference is not evenly divisible by 2,
        // it's impossible to achieve the condition.
        if ( t - s !== 2 * d ) {

            print ( -1 ); // Output -1.
            continue;     // Skip to the next iteration of the while loop.

        }


        // Flag to track if a solution is found.
        var ans = false;

        // Iterate through array 'a' to find a pair.
        rep ( n , function ( i ) {

            // Check if (a[i] + d) exists in array 'b'.
            if ( search ( a[i] + d ) ) {

                // If found, print the pair and set ans to true.
                print ( a[i] + ' ' + (a[i] + d) );
                ans = true;

                // Return false to break out of the 'rep' loop.
                return false;

            }

        } );

        // If no solution was found after checking all elements in 'a'.
        if ( !ans ) {

            print ( -1 ); // Output -1.

        }


        // Reset arrays 'a' and 'b' for the next iteration.
        a = [ ];
        b = [ ];

    } // End of while loop.

} // End of main function.


/**
 * A utility function for looping.
 * Can be called with (limit, callback) or (start, limit, callback).
 *
 * @param {number} a - Start index or loop limit.
 * @param {number|function} b - Loop limit or callback function.
 * @param {function} [c] - Callback function (optional).
 */
function rep ( a , b , c ) {

    // Adjust arguments if only two are provided.
    if ( c === undefined ) {

        c = b;
        b = a;
        a = 0;

    }

    // Loop from 'a' up to (but not including) 'b'.
    for ( var i = a ; i < b ; ++i ) {

        // If the callback returns false, break the loop.
        if ( c ( i ) === false ) {

            break;

        }

    }

} // End of rep function.


// Global variable to store input data.
var input = '';


/**
 * Extracts and returns the next number from the global input string.
 * @returns {number} The next number from input.
 */
function scan ( ) {

    return +input.pop ( );

}

/**
 * Extracts and returns the next string from the global input string.
 * @returns {string} The next string from input.
 */
function scan_string ( ) {

    return input.pop ( );

}

/**
 * Prints a value to the console.
 * @param {*} val - The value to be printed.
 */
function print ( val ) {

    console.log ( val );

}


// Node.js specific input/output handling.

// Resume stdin to start receiving data.
process.stdin.resume ( );

// Set the encoding for stdin.
process.stdin.setEncoding ( 'utf8' );

// Event listener for incoming data chunks.
process.stdin.on ( 'data' , function ( chunk ) {

    input += chunk; // Append chunk to the global input string.

} );

// Event listener for when stdin ends (all data has been received).
process.stdin.on ( 'end' , function ( ) {

    // Trim whitespace, split by any whitespace, and reverse the array
    // so pop() can be used to read elements in order.
    input = input.trim ( ).split ( /\s+/ ).reverse ( );

    // Call the main function to start processing.
    main ( );

} );