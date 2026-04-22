/*
 * This is a JavaScript program designed to solve a specific problem.
 * It reads input from standard input, processes it, and writes output to standard output.
 * The core logic involves calculations based on matrix-like data.
 */

"use strict" /* Ensure strict parsing and error handling for cleaner code. */


function Main ( stdin )
{
    // The main function where the program execution begins.
    // It takes the raw standard input string as an argument.

    /*
     * Process the input string:
     * 1. Trim leading/trailing whitespace.
     * 2. Split into an array of lines.
     * 3. Reverse the array so `pop()` can be used to read lines in original order.
     */
    stdin  =  stdin . trim ( ) . split ( "\n" ) . reverse ( ) ;

    // Initialize an array to store lines of output before joining and printing.
    var  stdout  =  [ ] ;

    /*
     * Helper function to read a single line of input.
     * It pops the last element from the reversed stdin array.
     */
    function  input ( )
    {
        return  stdin . pop ( ) ;
    }

    /*
     * Helper function to add a line to the output buffer.
     * It pushes the given value 'x' into the stdout array.
     */
    function  print ( x )
    {
        stdout . push ( x ) ;
    }

    /*
     * Helper function to convert an array of strings to an array of integers.
     * It uses the `map` method with `parseInt` to transform each element.
     */
    function  mapint ( x )
    {
        return  x . map ( n  =>  parseInt ( n ) ) ;
    }


    /*
     * Read the first line of input, which contains three space-separated integers:
     * n, m, and c.
     */
    var  tmp  =  mapint ( input ( ) . split ( " " ) ) ;

    // Destructure the values into individual variables for clarity.
    var  n  =  tmp [ 0 ] ; // Number of test cases or rows.
    var  m  =  tmp [ 1 ] ; // Number of elements per row.
    var  c  =  tmp [ 2 ] ; // A constant offset value.

    // Read the second line of input, which contains 'm' space-separated integers 'b'.
    var  b  =  mapint ( input ( ) . split ( " " ) ) ;

    // Initialize a counter for the final answer.
    var  ans  =  0 ;


    /*
     * Loop 'n' times to process each test case or row.
     */
    for  ( var  i  =  0 ;  i  <  n ;  i ++ )
    {
        // Read a line representing 'ai', which is 'm' space-separated integers.
        var  ai  =  mapint ( input ( ) . split ( " " ) ) ;

        // Initialize a sum 's' with the constant 'c'.
        var  s  =  c ;

        /*
         * Inner loop to calculate the dot product of 'ai' and 'b',
         * then add it to 's'.
         */
        for  ( var  j  =  0 ;  j  <  m ;  j ++ )
        {
            s  +=  ai [ j ]  *  b [ j ] ; // s = s + (ai[j] * b[j])
        }

        // If the calculated sum 's' is greater than zero, increment the answer counter.
        if  ( s  >  0 )
        {
            ans ++ ;
        }
    }

    // Print the final calculated answer.
    print ( ans ) ;


    // Join all accumulated output lines into a single string, separated by newlines.
    stdout  =  stdout . join ( "\n" ) ;

    // Print the final output string to the console (standard output).
    console . log ( stdout ) ;

    // Return the generated output string.
    return  stdout ;
}

/*
 * Call the Main function with input read from '/dev/stdin'.
 * This is a common pattern for competitive programming in Node.js.
 * 'fs.readFileSync' reads the entire file synchronously.
 * 'utf8' specifies the encoding.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) ) ;