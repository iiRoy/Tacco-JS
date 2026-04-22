/*
 * Main function to process input and calculate the result.
 * This function takes a string 's' as input, which is expected to be
 * multi-line.
 */
function Main( s ) {
    // Split the input string by newline characters to get an array of lines.
    // This prepares the data for further processing.
    s = s.split( "\n" ) ;

    /*
     * Parse the first line to get the integer 'n'.
     * The unary plus operator converts the string to a number.
     */
    var n = +s[ 0 ] ;

    // Process the second line:
    // 1. Split it by spaces to get an array of string numbers.
    // 2. Use map to convert each string number to an actual number.
    var a = s[ 1 ] . split( " " ) . map( a => +a ) ;

    // Initialize an empty array 'b'. This array will store prefix sums.
    var b = [ ] ;

    /*
     * Calculate prefix sums and store them in array 'b'.
     * The `reduce` method is used here to iterate through array 'a'.
     * 'a' in the reduce callback refers to the accumulator (current sum).
     * 'z' refers to the current element, 'i' to its index.
     * b[i-1] stores the prefix sum up to index 'i-1' of 'a'.
     * b[n-1] will store the total sum of 'a'.
     */
    b[ n - 1 ] = a . reduce( ( a, z, i ) => {
        // Store the current accumulated sum in b at index i-1.
        // This is a common pattern for prefix sums.
        b[ i - 1 ] = a ;
        // Return the sum of the accumulator and the current element.
        return a + z ;
    } ) ;

    // Initialize 'ans' with a very large number (9 * 10^9)
    // This will be used to find the minimum difference later.
    var ans = 9e9 ;

    // Loop through possible split points for the array.
    // The loop iterates from i = 2 up to n - 2 (exclusive of n-1).
    // This ensures there are at least two elements before 'i' and one after 'i'.
    for ( var i = 2 ; i < n - 1 ; i++ ) {
        // Calculate target sums for the left (sl) and right (sr) partitions.
        // sl is half of the sum up to index i-1.
        // sr is half of the sum from index i-1 to n-1 (inclusive of i-1).
        var sl = b[ i - 1 ] / 2 , sr = ( b[ n - 1 ] + b[ i - 1 ] ) / 2 ;

        // Find the lower bound for the left split point 'l'.
        // This 'l' aims to make b[l-1] as close to 'sl' as possible.
        var l = lower_bound( b , 1 , i - 1 , sl ) ;
        // Find the lower bound for the right split point 'r'.
        // This 'r' aims to make b[r-1] - b[i-1] as close to 'sr' as possible.
        var r = lower_bound( b , i + 1 , n - 1 , sr ) ;

        // Define the four segments based on current 'i', 'l', and 'r'.
        // m[0]: b[l-1] (first segment)
        // m[1]: b[i-1] - b[l-1] (second segment)
        // m[2]: b[r-1] - b[i-1] (third segment)
        // m[3]: b[n-1] - b[r-1] (fourth segment)
        var m = [ b[ l - 1 ] , b[ i - 1 ] - b[ l - 1 ] , b[ r - 1 ] - b[ i - 1 ] , b[ n - 1 ] - b[ r - 1 ] ] ;

        // Update the minimum answer: calculate (max_segment - min_segment) and take the minimum.
        ans = Math.min( ans , Math.max( ...m ) - Math.min( ...m ) ) ;

        // Check if there's an alternative split for 'l' (l+1) to consider.
        // This checks if moving 'l' one step further is valid.
        if ( i - l > 1 ) {
            // Re-calculate segments using b[l] instead of b[l-1] for the first segment.
            // This explores a slightly different partition for 'l'.
            m = [ b[ l ] , b[ i - 1 ] - b[ l ] , b[ r - 1 ] - b[ i - 1 ] , b[ n - 1 ] - b[ r - 1 ] ] ;
            // Update the minimum answer again with this new configuration.
            ans = Math.min( ans , Math.max( ...m ) - Math.min( ...m ) ) ;

            // Check if there's an alternative split for 'r' (r+1) to consider,
            // while also using the alternative 'l'.
            if ( n - r > 1 ) {
                // Re-calculate segments using b[l] and b[r] (instead of b[r-1]).
                // This explores a different partition for both 'l' and 'r'.
                m = [ b[ l ] , b[ i - 1 ] - b[ l ] , b[ r ] - b[ i - 1 ] , b[ n - 1 ] - b[ r ] ] ;
                // Update the minimum answer.
                ans = Math.min( ans , Math.max( ...m ) - Math.min( ...m ) ) ;
            }
        }

        // Check if there's an alternative split for 'r' (r+1) to consider,
        // using the original 'l' (b[l-1]).
        if ( n - r > 1 ) {
            // Re-calculate segments using b[l-1] and b[r] (instead of b[r-1]).
            // This explores a different partition for 'r'.
            m = [ b[ l - 1 ] , b[ i - 1 ] - b[ l - 1 ] , b[ r ] - b[ i - 1 ] , b[ n - 1 ] - b[ r ] ] ;
            // Update the minimum answer.
            ans = Math.min( ans , Math.max( ...m ) - Math.min( ...m ) ) ;
        }
    }

    // Print the final minimum difference found.
    console . log( ans ) ;
}


/*
 * Helper function: lower_bound (binary search implementation).
 * Finds the first element in a sorted array 'd' within range [a, b]
 * that is not less than 'e'.
 *
 * d: The array to search in.
 * a: The starting index for the search (inclusive).
 * b: The ending index for the search (exclusive).
 * e: The value to search for.
 */
function lower_bound( d , a , b , e ) {
    // Declare a variable 'c' for the middle index.
    var c ;
    // Perform binary search while there's at least two elements in the search range.
    while ( 1 < b - a ) {
        // Calculate the middle index using bitwise OR 0 for floor division.
        c = 0 | ( ( a + b ) / 2 ) ;
        // If the element at 'c' is less than 'e', move the 'a' pointer to 'c'.
        if ( d[ c ] < e ) {
            a = c ;
        }
        // Otherwise, move the 'b' pointer to 'c'.
        else {
            b = c ;
        }
    }
    // After the loop, 'a' and 'b' will be adjacent (or 'a' might be 'b-1').
    // Return 'b' if d[a] is less than 'e', otherwise return 'a'.
    // This correctly identifies the lower bound.
    return d[ a ] < e ? b : a ;
}


// Read input from standard input, decode it as UTF-8, and pass it to the Main function.
// This is a common way to handle input in competitive programming in Node.js.
Main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;