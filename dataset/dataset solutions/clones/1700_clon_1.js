/*
 * This is a Type I clone of the original JavaScript code.
 * It processes input, manipulates arrays, sorts, and calculates a result.
 */
function   Main (  input )    {
    // The input string is first split by newline characters.
    input  =  input . split ( "\n" ) ;

    // The second line of input (index 1) is split by spaces.
    tmp  =  input [ 1 ] . split ( " " ) ;


    // Parse the first line of input (index 0) as an integer for 'n'.
    var   n   =   parseInt ( input [ 0 ] ,   10 ) ;

    // Initialize an empty array 'a'.
    var   a   =   [ ] ;


    // Loop 'n' times to populate array 'a' with parsed integers from 'tmp'.
    for  ( var   i   =   0 ;   i   <   n ;   i ++ )
    {
        a . push ( parseInt ( tmp [ i ] ,   10 ) ) ;
    }

    // Initialize an empty array 'b'.
    b   =   [ ] ;

    // Populate array 'b' by duplicating each element from 'a'.
    for  ( var   i   =   0 ;   i   <   a . length ;   i ++ )
    {
        b . push ( a [ i ] ) ; // First copy
        b . push ( a [ i ] ) ; // Second copy
    }

    // Sort array 'b' in descending order.
    b . sort (
        function (   a ,   b   )
        {
            // Custom comparison function for descending order.
            return   ( a   <   b   ?   1   :   -1 ) ;
        }
    ) ;


    // Initialize 'result' with the first element of the sorted 'b' array.
    var   result   =   b [ 0 ] ;

    // Iterate from the third element (index 2) to 'n' and sum them into 'result'.
    for  ( var   i   =   2 ;   i   <   n ;   i ++ )
    {
        result   =   result   +   b [ i ] ;
    }

    // Output the final calculated result to the console.
    console . log ( result ) ;
}

// Call the Main function, reading input from standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;