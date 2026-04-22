function    Main ( input )   {
    // This is the main function that processes the input.
    // First, split the input string by newline characters.
    input = input.split ( "\n" ) ;

    /*
     * The second line of input (index 1) contains space-separated numbers.
     * We'll store them in a temporary array 'tmp'.
     */
    tmp = input[1] . split ( " " ) ;


    // The first line of input (index 0) contains N. Parse it as an integer.
    var   N   =   parseInt ( input[0] ,   10 ) ;
    // Initialize an array 'array_N' with a size based on N.
    var   array_N   =   new   Array ( 2 * N - 1 ) ;


    // Populate array_N by parsing elements from the 'tmp' array.
    for ( var   i   =   0 ;   i   <   array_N.length ;   i++ )
    {
        array_N [ i ]   =   parseInt ( tmp [ i ] ,   10 ) ;
    } // End of population loop.


    /*
     * Define a helper function to generate the next array in the sequence.
     * It takes an array and returns a new array where each element
     * is the median of three consecutive elements from the input array.
     */
    function   getArrayNext ( array_i )
    {
        // The new array will be shorter by 2 elements.
        array_i_next   =   new   Array ( array_i.length   -   2 ) ;

        // Iterate to fill the next array.
        for ( var   j   =   0 ;   j   <   array_i_next.length ;   j++ )
        {
            // Extract a small sub-array of three elements.
            var   small_array   =   array_i . slice ( j ,   j + 3 ) ;

            // Sort the small array and take the middle element (median).
            array_i_next [ j ]   =   small_array . sort (
                function ( a , b )
                {
                    // Custom comparison function for sorting.
                    return   ( a   <   b   ?   -1   :   1 ) ;
                }
            ) [ 1 ] ; // Get the element at index 1 (the median).
        }
        // Return the newly generated array.
        return   array_i_next ;
    }


    // Initialize the current array 'array_i' with the initial 'array_N'.
    var   array_i   =   array_N ;

    // Continue processing until 'array_i' contains only one element.
    while ( array_i.length   >   1 )
    {

        // Generate the next array in the sequence.
        array_i   =   getArrayNext ( array_i ) ;
    }

    // Output the final single element.
    console . log ( array_i [ 0 ] ) ;
} // End of Main function.


// Call the Main function with input read from stdin.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;