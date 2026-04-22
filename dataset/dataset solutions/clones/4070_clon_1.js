function  main  (  input  ) /* This is the primary function for processing input */
{
    // The input string is split by spaces into an array of strings.
    input  =  input .  split  (  " "  ) ;


    /*
     * Concatenate the first two elements of the input array.
     * These are expected to be numeric strings.
     */
    var  comb  =  input [ 0 ]  +  input [ 1 ] ;

    // Parse the concatenated string as an integer with base 10.
    var  a  =  parseInt  (  comb ,  10  ) ;

    // Calculate the square root of the parsed integer 'a'.
    var  x  =  Math .  sqrt  (  a  ) ;

    // Check if the calculated square root 'x' is an integer.
    if  (  Number .  isInteger  (  x  )  )
    {
        // If 'x' is an integer, print "Yes" to the console.
        console .  log  (  "Yes"  ) ;
    }
    else  /* Otherwise, if 'x' is not an integer */
    {
        // If 'x' is not an integer, print "No" to the console.
        console .  log  (  "No"  ) ;
    }
}

// Call the main function with input read from standard input.
main  (  require  (  'fs'  ) .  readFileSync  (  '/dev/stdin'  ,  'utf8'  )  ) ;