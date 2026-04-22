/* This comment indicates that the 'original_input' parameter will contain the entire input data. */


 function Main ( original_input )
{
    // The first line of input goes into input_1[0], second into input_1[1], and so on.
    input_1 = original_input . trim ( ) . split ( "\n" ) ;

    input_2 = input_1 [ 0 ] . split ( " " ) ;
    /* console.log(input_2); // This line is commented out for production */

    // Declare and initialize an array 'n' to store parsed numbers.
    var n = [ ] ;
    for ( let i = 0 ; i < 2 ; i ++ )
    {
        n . push ( parseInt ( input_2 [ i ] , 10 ) ) ;
    }
    // console.log(n); // Debugging line, currently disabled.

    // Calculate and print the final result.
    console . log ( n [ 0 ] - 1 - n [ 1 ] ) ;
}


/* DO NOT EDIT BELOW THIS LINE: handles standard input/output and calls Main */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;