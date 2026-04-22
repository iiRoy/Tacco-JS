"use strict"
; /* Enable strict mode for cleaner code practices */


const main = arg => { /* Define the main function that processes input */

    // Process the raw input string: trim leading/trailing whitespace and split by newline characters.
    arg = arg . trim ( ) . split ( "\n" ) ;


    // Parse the first line of input to get dimensions H (height) and W (width).
    // The dimensions are expected to be space-separated integers.
    let H = parseInt( arg [ 0 ] . split ( " " ) [ 0 ] ) ; // Height of the grid

    let W = parseInt( arg [ 0 ] . split ( " " ) [ 1 ] ) ; /* Width of the grid */


    // Initialize the answer with the total area, which is H * W.
    // This will be the maximum possible difference if no better split is found.
    let answer = H * W ;

    // Initialize an array 's' of size 3. This array will store the areas of the three resulting pieces.
    let s = [ ... Array ( 3 ) ] ;


    /*
     * The core logic involves trying different ways to split the rectangle into three pieces.
     * We iterate twice:
     * 1. First iteration: Consider H as height, W as width.
     * 2. Second iteration: Swap H and W (effectively rotating the rectangle by 90 degrees)
     *    and re-run the splitting logic. This covers all orientations.
     */
    for ( let i = 0 ; i < 2 ; i ++ ) {


        // Iterate through possible horizontal cut positions 'h' for the first split.
        // 'h' represents the height of the first piece.
        for ( let h = 1 ; h < H ; h ++ ) {

            // --- Strategy 1: Vertical cut for the first piece, then horizontal for the remaining two. ---

            // This comment indicates the 'vertical split' approach.
            // 縦割り
            s [ 0 ] = h * W ; // Area of the first piece (h x W)

            // The remaining rectangle has dimensions (H - h) x W.
            // We split this remaining part horizontally into two halves.
            s [ 1 ] = ( H - h ) * ( W / 2 ) ; // Area of the second piece (half of the remaining rectangle)

            // The third piece is the total area minus the first two pieces.
            s [ 2 ] = H * W - ( s [ 0 ] + s [ 1 ] ) ;


            // Sort the areas in ascending order to easily find the minimum and maximum.
            s . sort ( ( a , b ) => a - b ) ;

            // Update the minimum answer if the current difference between max and min piece is smaller.
            answer = Math . min ( answer , s [ 2 ] - s [ 0 ] ) ;


            // --- Strategy 2: Vertical cut for the first piece, then vertical for the remaining two. ---

            // This comment indicates the 'horizontal split' approach for the remaining part.
            // 横割り
            s [ 0 ] = h * W ; // Area of the first piece (same as before: h x W)

            // The remaining rectangle has dimensions (H - h) x W.
            // We split this remaining part vertically into two halves.
            s [ 1 ] = ( ( H - h ) / 2 ) * W ; // Area of the second piece (half of the remaining rectangle)

            // The third piece is the total area minus the first two pieces.
            s [ 2 ] = H * W - ( s [ 0 ] + s [ 1 ] ) ;


            // Sort the areas again after recalculating for this strategy.
            s . sort ( ( a , b ) => a - b ) ;

            // Update the minimum answer based on this strategy's result.
            answer = Math . min ( answer , s [ 2 ] - s [ 0 ] ) ;
        }


        // After trying all cuts for the current orientation,
        // swap H and W to simulate a 90-degree rotation of the original rectangle.
        // 90度回転
        let temp = H ; // Store the current H value temporarily

        H = W ; // Assign W to H

        W = temp ; // Assign the original H (stored in temp) to W
    }


    // Output the final minimum difference found.
    console . log ( answer ) ;
}

// Read input from stdin, decode it as UTF-8, and pass it to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;