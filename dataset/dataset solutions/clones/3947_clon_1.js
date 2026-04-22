function main ( input ) {
    // This is the main function responsible for processing the input and calculating the answer.
    // It takes an array of strings as input.

    /* Declare and initialize 'n' which represents the number of elements.
     * The first element of the input array is parsed as an integer.
     */
    var n = input [ 0 ] - 0 ;


    // Initialize two empty arrays to store processed data.
    var alist = [ ] ;
    var blist = [ ] ;

    // Loop through the input to populate 'alist' and 'blist'.
    // The loop runs 'n' times, starting from index 1.
    for ( var i = 1 ; i <= n ; i ++ ) {
        /* Each element input[i] is split by space, and then each part is
         * converted to a number before being pushed into 'alist'.
         */
        alist . push ( input [ i ] . split ( " " ) . map ( v => v - 0 ) ) ;
        // Similarly, elements input[i+n] are processed for 'blist'.
        blist . push ( input [ i + n ] . split ( " " ) . map ( v => v - 0 ) ) ;
    }

    // Sort 'alist' based on a custom comparison logic.
    // This sorts pairs (a[0], a[1]) where the primary key is a[0] unless a[0]>a[1], then a[1] is considered.
    alist . sort ( ( a , b ) => a [ 0 ] > a [ 1 ] ? ( a [ 1 ] - b [ 1 ] ) : ( a [ 0 ] - b [ 0 ] ) ) ;

    // Sort 'blist' using another custom comparison.
    // The sorting logic here is slightly different from 'alist'.
    blist . sort ( ( a , b ) => a [ 0 ] > a [ 1 ] ? ( b [ 1 ] - a [ 1 ] ) : ( a [ 0 ] - b [ 0 ] ) ) ;


    /* Initialize index variables for 'alist' and 'blist',
     * and a placeholder 'bmax' which isn't used after initialization.
     * 'ans' will store the final count.
     */
    var aidx = bidx = bmax = 0 ;
    var ans = 0 ;

    // Main loop to compare elements from 'alist' and 'blist'.
    // Continues as long as both indices are within bounds.
    while ( aidx < n && bidx < n ) {
        // Get current elements from both lists.
        var a = alist [ aidx ] ;
        var b = blist [ bidx ] ;

        // Check the condition for incrementing 'ans'.
        if ( a [ 0 ] < b [ 0 ] && a [ 1 ] < b [ 1 ] ) {
            // If condition met, increment 'ans' and advance both pointers.
            ans ++ ;
            aidx ++ ;
            bidx ++ ;
        } else {
            // If condition not met, only advance the 'blist' pointer.
            bidx ++ ;
        }
    }

    // Output the final calculated answer to the console.
    console . log ( ans ) ;

}

// Call the main function with input read from stdin.
// The input is read as UTF-8, trimmed for whitespace, and split by newlines.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( "\n" ) ) ;