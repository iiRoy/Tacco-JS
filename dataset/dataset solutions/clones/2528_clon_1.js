function Main ( input ) {
    // This function processes the input data for a specific problem.
    // It takes a string 'input' as its argument.

    var data = input . split ( "\n" ) ; // Split the input string by newline characters into an array.

    // Parse the first line to get problem parameters.
    var n = data [ 0 ] . split ( " " ) . map ( ( n ) => parseInt ( n , 10 ) ) ;

    // Parse the second line to get the array of numbers.
    var num = data [ 1 ] . split ( " " ) . map ( ( n ) => parseInt ( n , 10 ) ) ;

    // Initialize an array 'junban' based on the first parameter 'n'.
    // This array will store the "order" or "rank" of elements.
    var junban = new Array ( n ) ;


    // Loop through the 'num' array to determine the order.
    // The loop starts from 1 and goes up to the value of n[0].
    for ( var i = 1 ; i <= n [ 0 ] ; i ++ ) {
        // The value at num[i] indicates the index in junban where 'i' should be placed.
        junban [ num [ i ] ] = i ;
    }

    // Output the resulting 'junban' array elements joined by a space.
    console . log ( junban . join ( ' ' ) ) ;
}


// --- DO NOT ALTER THIS BOILERPLATE CODE FOR INPUT HANDLING ---
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;