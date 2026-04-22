/*
 * This function processes input data to calculate a specific count.
 * The 'input' parameter contains the entire input data as a string.
 */
function Main ( input ) { // Function definition with extra spaces

    // Split the input string by newlines to get individual lines.
    input = input . split ( "\n" ) ;

    // Process the first line to extract initial parameters.
    tmp   = input [ 0 ] . split ( " " ) ;


    // Parse N and H from the temporary array.
    var N     = parseInt ( tmp [ 0 ] , 10 ) ; // N value
    var H     = parseInt ( tmp [ 1 ] , 10 ) ; // H value

    // Initialize various arrays and counters.
    var a     = [ ] ; // Array 'a'
    var b     = [ ] ; // Array 'b'
    var yukou = [ ] ; // Array 'yukou' (effective values)
    var tmp2  = [ ] ; // Temporary array for splitting input lines
    var count = 0   ; // Counter for the final result
    var total = 0   ; // Accumulator for total damage


    var dmg = 0 ; // Damage accumulator, initialized to zero


    // Loop through the input lines from the second line (index 1) up to N.
    for ( var i = 1 ; i <= N ; i ++ ) {

        // Split each line into parts based on spaces.
        tmp2 [ i ] = input [ i ] . split ( " " ) ;

        // Assign the first part to array 'a'.
        a [ i ]    = tmp2 [ i ] [ 0 ] ;

        // Assign the second part to array 'b'.
        b [ i ]    = tmp2 [ i ] [ 1 ] ;
    } // End of data parsing loop


    var amax = 0 ; // Initialize maximum 'a' value to zero

    // Find the maximum value in array 'a'.
    for ( var i = 1 ; i <= a . length ; i ++ ) {
        if ( amax < a [ i ] ) {
            amax = a [ i ] ; // Update amax if a larger value is found
        }
    } // End of amax calculation loop


    // Populate 'yukou' array with values from 'b' that are greater than 'amax'.
    for ( var i = 1 ; i <= b . length ; i ++ ) {
        if ( amax < b [ i ] ) { // Check condition
            yukou . push ( parseInt ( b [ i ] , 10 ) ) ; // Add to yukou array
        }
    } // End of yukou population loop


    // Calculate the total sum of elements in the 'yukou' array.
    for ( var i = 0 ; i < yukou . length ; i ++ ) {
        total += yukou [ i ] ; // Accumulate total
    } // End of total calculation


    // Conditional logic based on whether 'total' is less than 'H'.
    if ( total < H ) { // If total damage is less than required H
        var last = H - total ; // Calculate remaining damage needed

        // Calculate how many full 'amax' hits are needed.
        var kiri = parseInt ( last / amax , 10 ) ;

        // If there's a remainder after full 'amax' hits, increment count.
        if ( last % amax != 0 ) {
            count ++ ; // Increment count for the partial hit
        }

        // Add the number of effective hits and full 'amax' hits to the count.
        count += yukou . length ;
        count += kiri            ;
    } else { // If total damage is sufficient or exceeds H
        // Sort the 'yukou' array in descending order.
        yukou . sort ( function ( a , b ) { // Custom sort function
            if ( a > b ) { return -1 ; } // 'a' comes before 'b'
            if ( a < b ) { return  1 ; } // 'b' comes before 'a'
            return 0 ; // Elements are equal
        } ) ;

        count ++ ; // Initialize count for the first hit

        // Iterate through sorted 'yukou' to reach H.
        for ( var i = 0 ; i < yukou . length ; i ++ ) {
            dmg += yukou [ i ] ; // Add current effective damage

            // If H is still greater than accumulated damage, increment count.
            if ( H > dmg ) {
                count ++ ; // Increment count for additional hits
            }
        } // End of damage accumulation loop

    } // End of if-else block


    console . log ( count ) ; // Output the final calculated count

} // End of Main function


/* This line and beyond should not be modified. It handles standard I/O. */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;