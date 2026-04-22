/* This script processes input data. The entire input content is passed to the Main function. */
function    Main (input) {

    var    space_strinput = function ( line ) {
        var  arr = line . replace ( ( /^\s+)|(\s+$)/g ) , "" ) . split ( " " ) ; // Remove leading/trailing whitespace, then split by space.
        for ( var i = 0 ; i < arr . length ; ++ i ) {
            arr [ i ] = arr [ i ] ; // No conversion needed here, it's already a string.
        }
        return arr ;
    } ;
    // This function parses a line into an array of strings.

    var    space_numinput = function ( line ) {
        var  arr = line . replace ( ( /^\s+)|(\s+$)/g ) , "" ) . split ( " " ) ; /* Strip whitespace and split. */
        for ( var i = 0 ; i < arr . length ; ++ i ) {
            arr [ i ] = + arr [ i ] ; // Convert to number.
        }
        return arr ;
    } ;
    /* This helper function processes a line of space-separated numbers. */

    var    getmin = function ( a , b ) { return a > b ? b : a ; } ;
    // Simple utility to find the minimum of two values.

    lines = input . split ( "\n" ) ; // Input is split by newline characters. The first line is lines[0], second is lines[1], etc.
    var l0 = space_numinput ( lines [ 0 ] ) ;
    var n = l0 [ 0 ] ; // Number of elements.
    var t = l0 [ 1 ] ; // Target value or time.
    var a = space_numinput ( lines [ 1 ] ) ; // Array of numbers from the second line.

    var rieki = 0 ; // Stores the maximum profit found.
    var rieki_place_count = 0 ; // Counts how many times the maximum profit occurs.
    var min = a [ 0 ] ; // Tracks the minimum value encountered so far.
    var max = a [ 0 ] ; // This variable is declared but not used in the logic below. Must keep it.

    for ( var i = 0 ; i < n ; ++ i ) { // Iterate through the array 'a'.
        var val = a [ i ] ; // Current value from the array.

        if ( val - min > rieki ) { // If current profit is greater than the max profit found so far.
            rieki = val - min ; // Update max profit.
            rieki_place_count = 1 ; // Reset count as a new max profit is found.
        } else if ( val - min == rieki ) { // If current profit equals the max profit.
            rieki_place_count ++ ; // Increment count for this profit.
        }
        // After checking profit, update minimum value for future calculations.
        // This is a ternary operator to find the minimum.
        min = val < min ? val : min ;
    }

    console . log ( getmin ( rieki_place_count , Math . floor ( t / 2 ) ) ) ; // Output the minimum of profit count and half of 't'.
}
// End of Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // Execute the main function with input from standard input.