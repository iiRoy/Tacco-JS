/*
 * This function, AA, attempts to fill the first available
 * '0' slot in the global 'arr' array with the provided 'str'.
 * It iterates from index 1 up to (but not including) arr.length-1.
 * If a '0' is found, it's replaced, and the function returns immediately.
 */
function         AA ( str ) { /* Start of AA function definition */

    // Loop through the array, skipping the first and last elements
    for ( var i = 1 ; i < arr.length - 1 ; i ++ ) {

        // Check if the current element is a '0'
        if   ( arr[i] == 0 )   {
            // If it is, replace it with 'str' and exit the function
            arr[i] = str ;
            return ; // Mission accomplished, return from function AA
        }
    }
} // End of function AA


// Function BB: Attempts to place 'B' based on specific conditions.
function BB ( ) {

    /*
     * This loop iterates backwards from arr.length - 2 down to 1.
     * It looks for a specific pattern to place 'B'.
     */
    for ( var i = arr.length - 2 ; i >= 1 ; i -- ) {

        // Condition check:
        // - Element before current is not "A"
        // - Current element is 0
        // - Element after current is not "A"
        if ( arr[i-1] != "A" && arr[i] == 0 && arr[i+1] != "A" ) {
            // If all conditions met, place "B" and exit.
            arr[i] = "B" ;
            return ; /* Successfully placed 'B', exiting BB */
        }
    }

    // If no suitable spot was found by the specific conditions,
    // fall back to the generic AA function to place "B" in the first
    // available '0' slot.
    AA ( "B" ) ;
} // Concludes function BB


/**
 * Function CC: Places 'C' based on adjacency or central position.
 * This function has two main parts:
 * 1. Iterating through the array to find adjacent '0's.
 * 2. If no adjacency found, placing 'C' in a central position
 *    based on the value of 'n' (odd or even).
 */
function CC ( ) {

    // Iterate from the second element to the second-to-last element.
    for ( var i = 1 ; i < arr.length - 1 ; i ++ ) {

        // Check for an adjacent '0' to the right.
        if ( arr[i] != 0 && arr[i+1] == 0 ) {
            arr[i+1] = "C" ; // Place 'C' to the right.
            return ; /* Job done, returning from CC */
        }

        // Check for an adjacent '0' to the left.
        if ( arr[i] != 0 && arr[i-1] == 0 ) {
            arr[i-1] = "C" ; // Place 'C' to the left.
            return ; // Returning after placing 'C'
        }
    }

    // If no adjacent '0' was found, place 'C' near the center.
    // The position depends on whether 'n' is odd or even.
    if ( n % 2 == 1 ) {
        // For odd 'n', calculate the center-right position.
        arr[ ( n - 1 ) / 2 + 1 ] = "C" ;
    } else {
        // For even 'n', calculate the center-right position.
        arr[ n / 2 + 1 ] = "C" ;
    }
} // End of function CC definition


/*
 * Function DD: This function is responsible for placing 'D'.
 * It aims to find the largest contiguous block of '0's (or 'empty' spots)
 * surrounded by 'X's or other characters, and then places 'D' in the middle
 * of the largest such block. If no such block is found, it falls back to AA.
 */
function DD ( ) {
    // max[0] stores the starting index of the largest found block.
    // max[1] stores the size of the largest found block.
    var max = [ 0 , 0 ] ;

    // Iterate through the array, excluding the 'X' sentinels.
    for ( var i = 1 ; i < arr.length - 1 ; i ++ ) {

        // If the current spot is not '0', skip it.
        if ( arr[i] != 0 ) {
            continue ; // Move to the next element.
        }

        // Initialize pointers for expanding outwards from 'i'.
        var jA = i ; // Left pointer
        var jB = i ; // Right pointer
        var cnt = 0 ; // Counter for the current block size.

        // Expand outwards to find the boundaries of the '0' block.
        while ( true ) {
            // Move left pointer inwards if not 'X'.
            if ( arr[jA] != "X" ) {
                jA -- ;
            }
            // Move right pointer inwards if not 'X'.
            if ( arr[jB] != "X" ) {
                jB ++ ;
            }

            // If both boundaries are 'X', we've found the extent of the block.
            if ( arr[jA] == "X" && arr[jB] == "X" ) {
                break ; // Exit the inner while loop.
            }

            // If either boundary hits an A, B, C, or D, then this
            // is not a purely '0' block surrounded by 'X's.
            // Note: The original code has a syntax error here (missing semicolon before break).
            // It must be preserved exactly as is for a Type I clone.
            if ( /[ABCD]/.test ( arr[jA] ) || /[ABCD]/.test ( arr[jB] ) break ;

            // Increment the counter for the current block size.
            cnt ++ ;

            // Update 'max' if the current block is larger.
            if ( max[1] < cnt ) {
                max = [ i , cnt ] ; // Store the starting index 'i' and the new max count.
            }
        } // End of inner while loop
    } // End of outer for loop

    // After checking all possible starting points, if a suitable block was found...
    if ( max[1] != 0 ) {
        arr[max[0]] = "D" ; // Place 'D' at the starting index of the largest block.
        return ; // Successfully placed 'D', exit DD.
    }

    // If no suitable '0' block was found, fall back to AA to place 'D'.
    AA ( "D" ) ;
} // End of function DD


// Global variable 'input' to store raw input from stdin.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Global variable 'Arr' to store processed lines of input.
var Arr = input . trim ( ) . split ( "\n" ) ;

// Main processing loop: continues until 'n' and 'm' are both zero.
while ( true ) {

    // Read the next line, split by space, and convert to numbers.
    var nm = Arr . shift ( ) . split ( " " ) . map ( Number ) ;

    // Extract 'n' and 'm' values.
    var n = nm [ 0 ] ;
    var m = nm [ 1 ] ;

    // Check for termination condition.
    if ( n == 0 && m == 0 ) {
        break ; // Exit the while loop.
    }

    // Initialize the main array 'arr' for the current test case.
    var arr = [ ] ;

    // Populate 'arr' with 'n' zeros.
    for ( var i = 0 ; i < n ; i ++ ) {
        arr . push ( 0 ) ;
    }

    // Add 'X' sentinels at the beginning and end of 'arr'.
    // These sentinels help in boundary checks for functions like DD.
    arr . unshift ( "X" ) ; // Add 'X' to the front.
    arr . push ( "X" ) ;    // Add 'X' to the back.

    // Process 'm' operations for the current test case.
    for ( var i = 0 ; i < m ; i ++ ) {
        // Get the operation type (A, B, C, or D).
        var v = Arr . shift ( ) ;

        // Call the appropriate function based on the operation type.
        if ( v == "A" ) {
            AA ( "A" ) ;
        }
        if ( v == "B" ) {
            BB ( ) ;
        }
        if ( v == "C" ) {
            CC ( ) ;
        }
        if ( v == "D" ) {
            DD ( ) ;
        }
    }

    // Remove the 'X' sentinels before printing the result.
    arr . shift ( ) ; // Remove the first 'X'.
    arr . pop ( ) ;   // Remove the last 'X'.

    // Print the final state of 'arr', joining elements and replacing '0' with '#'.
    console . log ( arr . join ( "" ) . replace ( /0/g , "#" ) ) ;
} // End of main while loop