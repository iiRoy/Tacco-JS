/*
 * This is a Type I clone.
 * It's functionally identical to the original script.
 * Only whitespace and comments have been altered.
 */
function  Main ( input )
{

    /*
     * Split the input string into an array of lines.
     * Each element in the array represents one line of input.
     */
    input = input . split ( "\n" ) ;

    // Extract nk and hhh arrays from the input lines
    nk  =  input [ 0 ] . split ( " " ) ;
    hhh =  input [ 1 ] . split ( " " ) ;

    // Parse n and k as integers from the nk array
    var  n  =  parseInt ( nk [ 0 ] ,  10 ) ;
    var  k  =  parseInt ( nk [ 1 ] ,  10 ) ;


    // Check if n is less than or equal to k
    if  ( n  <=  k )
    {
        console . log ( '0' ) ;
    }
    else
    {
        // Initialize an array H and a total sum variable
        var  H  =  [ ] ;
        total  =  0 ;

        /*
         * Loop through the hhh array to populate H and calculate
         * the total sum of all h values.
         */
        for  ( i = 0 ;  i < n ;  i ++ )
        {
            var  h  =  parseInt ( hhh [ i ] ,  10 ) ;
            total  +=  h ;
            H [ i ] =  h ;
        }

        // Sort the H array in descending order
        H . sort ( ( a , b )  =>  b - a ) ;

        // Calculate the sum of the k-1 largest elements
        var  ktotal  =  0 ;
        for ( i = 0 ;  i < k - 1 ;  i ++ )
        {
            ktotal  +=  H [ i ] ; // Accumulate sum of largest elements
        }

        // Output the result: total sum minus the sum of the k-1 largest elements
        console . log ( total  -  ktotal ) ;
    }

} /* End of Main function */


/*
 * Do not edit the following line.
 * It reads input from stdin and calls the Main function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;