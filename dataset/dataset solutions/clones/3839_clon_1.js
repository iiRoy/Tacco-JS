/*
 * This is the main function
 * that processes the input.
 */
function     Main (  input   )
{

    input  =  input .  split ( "\n" ) ;


    // Extract the first line, convert to string, then to lowercase.
    var     string     =    input [   0   ] .  toString ( ) .  toLowerCase ( ) ;


    // Parse the second line as an integer for K.
    var  K     =     parseInt (   input [   1   ]   ) ;


    /*
     * Calculate the length of the processed string.
     * This will be used for substring generation limits.
     */
    var     substringCounts     =     string .  length ;


    /*
     * The following block of code was originally commented out.
     * It remains commented out to maintain Type I clone definition,
     * which requires exact equality of active code fragments.
     * Only whitespace and comments are allowed to change.
     */

    // /*
    //  * Original commented-out validation checks.
    //  * These are preserved as comments.
    //  */
    // //     if ( substringCounts < 1 || 5000 < substringCounts )
    // //
    // //         return ;
    // //
    // //
    // //
    // //     if ( K < 1 || 5 < K )
    // //
    // //         return ;
    //
    //
    //
    //
    // /*
    //  *   This section was intended to find unique substrings, sort them,
    //  *   and then print the K-th element. It's currently inactive.
    //  */
    //
    //
    // var     stacks      =   [ ] ;
    //
    //
    // var     _substr     =   '' ;
    //
    //
    // for (  var     i   =   0 ;     i   <=  substringCounts ;     i++   )
    // {
    //
    //     for (  var     j   =   i ;     j   <=  substringCounts ;     j++   )
    //     {
    //
    //         _substr     =   string .  substring (  i ,  j  ) ;
    //
    //         if (   ! stacks .  includes (  _substr  )   &&   ! _substr .  includes (  '\n'  )   &&   _substr   !==   ''   )
    //
    //             stacks .  push (  string .  substring (  i ,  j  )  ) ;
    //
    //     }
    //
    // }
    //
    //
    // stacks .  sort ( ) ;
    //
    //
    // console .  log (  stacks [  K   -   1  ]  ) ;


} /* End of Main function */


// Call the Main function with input from stdin.
Main (   require ( "fs" ) .  readFileSync ( "/dev/stdin" , "utf8" )   ) ;