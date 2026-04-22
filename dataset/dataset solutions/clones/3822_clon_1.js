/*
 * This is a self-executing anonymous function
 * designed to process input and print a sum.
 */
( function  js ( ) {
    // Declare variables that will be used within this scope
    var   a  ,
          b  ,
          c  ,
          line
    ; // End of variable declarations

    // Read a line of input, then split it by spaces into an array
    line   =   readline ( ) . split ( " " ) ;

    // Assign array elements to respective variables
    a   =   line [ 0 ] ; // First element
    b   =   line [ 1 ] ; // Second element
    c   =   line [ 2 ] ; // Third element (though not used in the final calculation)

    // Convert 'a' and 'b' to integers and print their sum
    print ( parseInt ( a )   +   parseInt ( b ) ) ;

} ) ( ) ; /* Function execution ends here */