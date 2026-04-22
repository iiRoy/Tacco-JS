/* This is a main function responsible for processing input data. */
function   Main (  input   ) { // Modified function definition spacing and added comment

    // The input string is split into an array of lines.
    input   =   input.split ( "\n" ) ; // Added extra spaces and a new comment

    /* Extracting the second line, splitting by space, and converting to numbers. */
    var   arr   =   input [ 1 ] .split ( " " ) .map ( Number ) ; // More spaces, different comment style

    // Sorting the array in ascending order using a comparison function.
    arr   =   arr .sort ( function ( a , b ) {   return   a - b   } ) ; // Lots of spaces, new comment

    // Calculating the initial average of the first two elements.
    var   n   =   ( arr [ 0 ]   +   arr [ 1 ] )   /   2 ; // Spacing, new comment

    // Original debug log line, now completely removed.
    // console.log(arr);

    // Removing the first two elements from the array after calculating their average.
    arr .shift ( ) ;
    arr .shift ( ) ;

    // Another commented out debug line, for checking array state.
    // console.log(arr, n);

    // Main loop: continues as long as there are elements in the array.
    while ( arr .length   !=   0 ) {
        /* Inserting the current average 'n' into the sorted array at the correct position
         * determined by the nibu (binary search) function. */
        arr .splice ( nibu ( arr , n ) ,   0 ,   n ) ;

        // A debug line that was previously commented out, now removed.
        //   console.log(arr);

        // Recalculating the average of the new first two elements in the modified array.
        n   =   ( arr [ 0 ]   +   arr [ 1 ] )   /   2 ;

        // Removing the first two elements again, preparing for the next iteration.
        arr .shift ( ) ;
        arr .shift ( ) ;
    }

    // Outputting the final calculated value 'n' to the console.
    console .log ( n )
}

// Immediately invoke the Main function with input read from standard input.
Main ( require ( "fs" ) .readFileSync ( "/dev/stdin" ,   "utf8" ) .trim ( ) ) ;


/*
 * This helper function performs a binary search (nibu means binary search in Japanese, 二分探索)
 * to find the insertion point for a value in a sorted array, or its exact index if present.
 */
function   nibu (   a ,   searchValue   ) {
	// Initialize the index to -1, indicating the value has not been found yet.
	var   index   =   -1 ;

    // 'left' variable tracks the left boundary (inclusive) of the current search range.
    var left = 0;

    // 'right' variable tracks the right boundary (inclusive) of the current search range.
    var right = a.length - 1;

    // The binary search loop continues as long as the left boundary does not exceed the right boundary.
    while ( left   <=   right ) {

        // Calculate the middle index of the current search range, ensuring it's an integer.
        var   middle   =   Math .floor ( ( left   +   right )   /   2 ) ;

        // Compare the value at the middle index with the target search value.
        if ( a [ middle ]   ==   searchValue ) {
            // If they match, the value is found. Store its index and exit the loop.
            index   =   middle ;
            break ;
        } else   if ( a [ middle ]   <   searchValue ) {
            // If the middle value is less than the search value,
            // the search value must be in the right half. Adjust the left boundary to 'middle + 1'.
            left   =   middle   +   1 ;
        } else {
            // If the middle value is greater than the search value,
            // the search value must be in the left half. Adjust the right boundary to 'middle - 1'.
            right   =   middle   -   1 ;
        }
    }

    // After the loop, if the value was found (index is not -1), return its exact index.
    if ( index   !=   -1 )   return   index ;
    // Otherwise, the value was not found, and 'left' now indicates the correct insertion point
    // where the searchValue should be placed to maintain sorted order.
    else   return   left ;
}