function        Main (   input )
{
    // This is the main function that processes the input.

    const   N   =   parseInt ( input ) ;

    var     a   =   [ ] ; /*   Initialize an empty array 'a'   */

    if  ( N == 3 )
    {
        a [ 0 ]     =   2   ;
        a [ 1 ]     =   3   ;
        a [ 2 ]     =   25  ;
        /* It is also acceptable to write a = [2, 3, 25]; */
    }
    else
    {
        for ( var   i   =   0 ; i   <   N ; i++ )
        {
            a [ i ]     =   i   *   2 ;
        }
    }


    /*
     * Displaying the final result.
     */
    console.log ( a.join ( " " ) ) ;


}
// Call the Main function with the standard input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;