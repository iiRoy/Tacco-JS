/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical equivalence,
 * with only variations in whitespace and comments.
 * The purpose is to demonstrate a Type I code clone.
 */
function Main ( input ) {

    // Process the raw input string
    input = input.trim().split("\n").map(function(x) {
        // Each line is split by space
        return x.split(" ");
    });

    // Parse dimensions H (Height) and W (Width) from the first line of input
    var H = parseInt(input[0][0] , 10); // Height value
    var W = parseInt(input[0][1] , 10); // Width value

    // Call the core calculation function
    var ans = calc ( H , W );

    // Output the final answer to the console
    console.log ( ans );

} // End of Main function definition

/*
 * This function calculates the minimum difference in area when
 * a rectangular grid of dimensions H x W is divided into three parts.
 * It considers different division strategies.
 * @param {number} H - The height of the grid.
 * @param {number} W - The width of the grid.
 * @returns {number} The minimum possible difference in area.
 */
function calc ( H , W ) {

    // Optimization: If either dimension is a multiple of 3,
    // it's possible to divide perfectly, resulting in 0 difference.
    if ( ( H % 3 ) === 0 || ( W % 3 ) === 0 ) {
        return 0; // No difference needed
    }

    // Initialize result with the maximum possible difference (H * W)
    // This value will be iteratively reduced.
    var result = H * W;

    var tmp ; // Temporary variable for current difference
    var oldtmp = result ; // Stores the previous temporary difference for early exit optimization

    // First set of calculations: Iterate through possible vertical cuts (W-axis)
    // and then horizontal cuts within the remaining two parts.
    for ( var i = 0 ; i <= W ; i++ ) {

        // Calculate the maximum area difference for a given cut 'i'
        // This involves dividing the H x (W-i) part into two.
        tmp = Math.max(
              Math.abs( i * H - ( W - i ) * Math.ceil( H / 2 ) ) , // Option 1: cut H almost in half (ceiling)
              Math.abs( i * H - ( W - i ) * Math.floor( H / 2 ) ) , // Option 2: cut H almost in half (floor)
              ( H % 2 ) * ( W - i ) // This term captures the case where H is odd and (W-i) is large,
                                    // ensuring the third piece isn't tiny.
        );

        // Update the overall minimum result
        result = Math.min( result , tmp );

        // Early exit optimization: if current 'tmp' is worse than the previous 'oldtmp',
        // further iterations in this direction are unlikely to yield better results.
        if ( tmp > oldtmp ) {
            break;
        }

        // Update oldtmp for the next iteration comparison
        oldtmp = tmp ;
    } // End of first loop

    // Swap H and W to perform the same calculations but with dimensions effectively rotated.
    // This covers cases where the initial cuts are better made along the other axis.
    [ W , H ] = [ H , W ]; // Array destructuring for swapping values.

    // Re-initialize oldtmp with the new H * W product.
    oldtmp = H * W; // Resetting for the second set of calculations.

    // Second set of calculations: Same logic as before, but with H and W swapped.
    // This effectively considers initial horizontal cuts (H-axis)
    // and then vertical cuts within the remaining two parts.
    for ( var i = 0 ; i <= W ; i++ ) {

        // Calculate the maximum area difference with swapped dimensions
        tmp = Math.max(
              Math.abs( i * H - ( W - i ) * Math.ceil( H / 2 ) ) ,
              Math.abs( i * H - ( W - i ) * Math.floor( H / 2 ) ) ,
              ( H % 2 ) * ( W - i )
        );

        // Update the overall minimum result again
        result = Math.min( result , tmp );

        // Another early exit check for optimization
        if ( tmp > oldtmp ) {
            break ;
        }

        oldtmp = tmp ; // Update oldtmp
    } // End of second loop

    // The final result is the minimum of all calculated differences,
    // and also explicitly H and W themselves (in case one dimension is very small,
    // leading to a simpler 3-way split directly along that dimension).
    return Math.min( result , H , W );

} // End of calc function

// This line executes the Main function with input read from stdin.
// It uses Node.js 'fs' module to synchronously read the entire file.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
/* End of file */