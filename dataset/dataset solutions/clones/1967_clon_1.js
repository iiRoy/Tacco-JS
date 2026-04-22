/*
 * This is a Type I clone of a JavaScript program.
 * It processes input to count occurrences of numbers.
 */
function Main ( input )
{
    // Split the input string by newline characters to get individual lines.
    var lines = input . split ( '\n' ) ;

    // Convert the first line to a number, representing N.
    var N = Number ( lines [ 0 ] ) ;

    // Split the second line by spaces to get an array of strings.
    var A = lines [ 1 ] . split ( ' ' ) ;

    // Initialize an empty array to store numbers.
    var A_number = [ ] ;

    /*
     * Loop through the array A (excluding the last element if N-1 is relevant for the loop bounds).
     * Convert each string element to a number and push it into A_number.
     */
    for ( var j = 0 ; j < N - 1 ; j ++ )
    {
        A_number . push ( Number ( A [ j ] ) ) ;
    }


    /*
     * Sort the A_number array in ascending order.
     * This uses a custom comparison function for numeric sorting.
     */
    A_number . sort ( function ( a , b )
    {
        // If 'a' is less than 'b', return -1 to place 'a' before 'b'.
        if ( a < b ) return -1 ;

        // If 'a' is greater than 'b', return 1 to place 'a' after 'b'.
        if ( a > b ) return 1 ;

        // If 'a' and 'b' are equal, return 0 to maintain their relative order.
        return 0 ;
    } ) ;


    // Initialize an index for iterating through the sorted A_number array.
    var index = 0 ;

    // Declare a variable to hold the count of occurrences.
    var count ;


    // Iterate from 1 up to N (inclusive).
    for ( var i = 1 ; i <= N ; i ++ )
    {
        // Reset count for each number 'i'.
        count = 0 ;

        /*
         * While the current element in A_number matches 'i'
         * and we haven't gone past the end of the array,
         * increment the index and the count.
         */
        while ( A_number [ index ] == i && index < N )
        {
            index ++ ; // Move to the next element.
            count ++ ; // Increment the count for 'i'.
        }

        // Output the count for the current number 'i'.
        console . log ( count ) ;
    }
}

// Read input from stdin and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;