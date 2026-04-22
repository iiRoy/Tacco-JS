/*
 * This JavaScript program processes input data
 * to calculate specific counts based on character comparisons
 * across multiple input lines.
 */
function  Main ( input )
{
    // The entire input data is passed to this function.
    input  =  input . split ( "\n" ) ;

    /*
     * Parse the first line to get the value of 'n'.
     * 'n' represents the number of elements to compare.
     */
    var  n  =  parseInt ( input [ 0 ] ,  10 ) ;

    // Split the subsequent input lines into character arrays.
    var  a  =  input [ 1 ] . split ( "" ) ;
    var  b  =  input [ 2 ] . split ( "" ) ;
    var  c  =  input [ 3 ] . split ( "" ) ;

    // Initialize counters for differences between pairs of arrays.
    var  abCount  =  0 ;
    var  acCount  =  0 ;
    var  bcCount  =  0 ;

    // Loop through 'n' elements to compare characters at each index.
    for  ( var  i  =  0 ;  i  <  n ;  i ++ )
    {
        // Check if characters in array 'a' and 'b' are different.
        if  ( ( a [ i ]  !=  b [ i ] ) )
        {
            abCount ++ ;
        }

        // Check if characters in array 'a' and 'c' are different.
        if  ( ( a [ i ]  !=  c [ i ] ) )
        {
            acCount ++ ;
        }

        // Check if characters in array 'b' and 'c' are different.
        if  ( ( b [ i ]  !=  c [ i ] ) )
        {
            bcCount ++ ;
        }
    }

    // Calculate total counts for each 'path' or 'strategy'.
    var  aCount  =  abCount  +  acCount ;
    var  bCount  =  abCount  +  bcCount ;
    var  cCount  =  acCount  +  bcCount ;

    /*
     * Output the minimum of the three calculated counts.
     * This represents the optimal strategy.
     */
    console . log ( '%d' ,  Math . min ( aCount ,  bCount ,  cCount ) ) ;

}

/*
 * !!! IMPORTANT: Do not modify the code below this line. !!!
 * It handles standard input/output operations,
 * reading all data at once and then invoking the 'Main' function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) ) ;