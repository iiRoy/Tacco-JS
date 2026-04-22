function   Main  (  s  )
{
    // This function processes a string input and performs a calculation.

    /*
     * The input string 's' is expected to contain space-separated numbers.
     * First, split the string by spaces.
     * Then, map each resulting string element to a number using the unary plus operator.
     */
    s    =    s  .  split ( " " )  .  map ( a  =>  + a ) ;

    // Extract numerical values from the processed array.
    var   n    =    s [ 0 ] ; // The first number in the input array.

    // The second number, adjusted by subtracting one.
    var   m    =    s [ 1 ]   -   1 ;

    var   d    =    s [ 2 ] ; // The third number.

    /*
     * Determine the value of 'a' based on 'd'.
     * If 'd' is truthy (non-zero), 'a' will be 2.
     * Otherwise (if 'd' is zero or falsy), 'a' will be 1.
     */
    var   a    =    d   ?   2   :   1 ;

    // Perform the final calculation and print the result to the console.
    // The formula is: m * (n - d) * a / (n * n)
    console  .  log ( m   *   ( n   -   d )   *   a   /   ( n   *   n ) ) ;

} /* End of Main function definition */


// Call the Main function with input read from standard input.
// This reads the entire file content as a string using UTF-8 encoding.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // Execute the primary logic.