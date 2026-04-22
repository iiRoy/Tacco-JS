/*
 * This file contains the main logic for processing input data.
 * It calculates certain values based on the input array 's'.
 * Extensive whitespace and comments are used for demonstration purposes.
 */

function Main ( s ) {
    // Process the first line of input to extract dimensions and count.
    s [ 0 ]  =  s [ 0 ] . split ( " " ) . map ( a  =>  parseInt ( a ) ) ;

    // Define constants for height, width, and number of items.
    const  h  =  s [ 0 ] [ 0 ]  -  2 ; // Adjusted height.
    const  w  =  s [ 0 ] [ 1 ]  -  2 ; // Adjusted width.
    const  n  =  s [ 0 ] [ 2 ] ; // Number of items.

    // Initialize a 3-element array of empty objects. This 'm' array acts as a circular buffer.
    var  m  =  [ { } ,  { } ,  { } ] ;

    // Loop through the input to parse subsequent lines.
    for ( var  i  =  0 ;  i  <  n ;  i ++ ) {
        s [ i ]  =  s [ i + 1 ] . split ( " " ) . map ( a  =>  parseInt ( a ) ) ;
    }

    // Remove the last element, which is likely an empty string from the final newline.
    s . pop ( ) ;

    // Sort the processed input array based on the first element of each sub-array.
    s  =  s . sort ( ( a , b )  =>  a [ 0 ]  -  b [ 0 ] ) ;


    // Initialize an array 'ans' of size 10 with all zeros.
    var  ans  =  Array ( 10 ) . fill ( 0 ) ;
    var  y  =  1 ; // Y-coordinate counter.

    // Main processing loop for each item.
    for ( i  =  0 ;  i  <  n ;  i ++ ) {
        var  q  =  0 ; // Counter for skipping y-coordinates.

        /*
         * This while loop processes 'y' coordinates that are significantly
         * smaller than the current item's 'y' coordinate (s[i][0]).
         * It clears out old entries from the circular buffer 'm'.
         */
        while ( y  +  2  <  s [ i ] [ 0 ] ) {
            // Iterate over properties in the current 'm' slot.
            for ( var  k  in  m [ y % 3 ] ) {
                ans [ m [ y % 3 ] [ k ] ] ++ ; // Increment count in 'ans'.
            }
            m [ y % 3 ]  =  { } ; // Clear the current slot.
            y ++ ; // Move to the next y-coordinate.
            q ++ ; // Increment skip counter.
            /*
             * If 'q' reaches 3, it means we've skipped a few 'y' rows.
             * We can then jump 'y' directly to near the current item's 'y'.
             */
            if ( q  >=  3 )  y  =  s [ i ] [ 0 ]  -  2 ;
        }
        // Call the 'paint' function to update the grid based on the current item.
        paint ( s [ i ] [ 1 ] ,  s [ i ] [ 0 ] ) ;
    }

    /*
     * The 'paint' function updates the 'm' circular buffer
     * based on the given x and y coordinates.
     * It simulates placing a 3x3 square on a grid.
     */
    function  paint ( x ,  y ) {
        for ( var  i  =  -2 ;  i  <=  0 ;  i ++ ) {
            if ( x  +  i  <  1 )  continue ; // Skip if x-coordinate is out of bounds (left).
            if ( x  +  i  >  w )  break ;    // Stop if x-coordinate is out of bounds (right).
            for ( var  j  =  -2 ;  j  <=  0 ;  j ++ ) {
                var  yj  =  y  +  j ; // Calculate adjusted y-coordinate.
                if ( yj  <  1 )  continue ; // Skip if y-coordinate is out of bounds (top).
                if ( yj  >  h )  break ;    // Stop if y-coordinate is out of bounds (bottom).
                var  s  =  x  +  i ; // Calculate adjusted x-coordinate.
                // Update the count in the 'm' buffer for the specific (yj, s) cell.
                if ( ! m [ yj % 3 ] [ s ] )  m [ yj % 3 ] [ s ]  =  1 ;
                else  m [ yj % 3 ] [ s ] ++ ;
            }
        }
    }

    // After processing all items, iterate through remaining entries in 'm'.
    for ( i  =  0 ;  i  <  3 ;  i ++ ) {
        for ( k  in  m [ i ] ) {
            ans [ m [ i ] [ k ] ] ++ ; // Update 'ans' with final counts.
        }
    }

    // Calculate the total area (h * w) and store it in ans[0].
    ans [ 0 ]  =  h  *  w ;
    var  f  =  0 ; // Flag/counter for large numbers.

    // Handle potential overflow for very large numbers.
    if ( ans [ 0 ]  >  9e15 ) { // If ans[0] is extremely large.
        ans [ 0 ]  =  ( h  %  1e5  *  w ) ; // Reduce h modulo 1e5.
        f  =  Math . floor ( ans [ 0 ]  /  1e5 ) ; // Store carry-over.
        ans [ 0 ]  %=  1e5 ; // Keep the remainder.
    }

    // Subtract counts from ans[1] through ans[9] from ans[0].
    for ( i  =  1 ;  i  <=  9 ;  i ++ ) {
        ans [ 0 ]  -=  ans [ i ] ;
    }

    // If 'f' (carry-over) is present, perform additional calculations for large numbers.
    if ( f ) {
        f  +=  Math . floor ( h  /  1e5 )  *  w ; // Adjust 'f' further.
        while ( ans [ 0 ]  <  0 ) {
            f -- ; // Decrement carry.
            ans [ 0 ]  +=  1e5 ; // Adjust ans[0].
        }
        // Format ans[0] with leading zeros and concatenate with 'f'.
        ans [ 0 ]  =  ( "00000"  +  ans [ 0 ]  %  1e5 ) . slice ( -5 ) ;
        ans [ 0 ]  =  f  +  ans [ 0 ] ;
    }

    // Output the final results, joined by newlines.
    console . log ( ans . join ( "\n" ) ) ;
}

/*
 * This is the entry point for the program.
 * It reads input from stdin, splits it by newline,
 * and passes it to the Main function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) . split ( "\n" ) ) ;