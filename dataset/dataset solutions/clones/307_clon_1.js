/* This is a self-executing anonymous function to encapsulate the entire program logic. */
(   function   (   )   {
    // Declare a variable to accumulate all standard input.
    var   input   =   ''   ;


    /**
     * This is the primary function responsible for processing the gathered input
     * and producing the desired output.
     */
    function   main   ( )   {
        // Declare local variables that will be used within this function scope.
        var   a   ,   b   ,   nums   ,
              TSUBO   =   3.305785   ;   // Define the constant for Tsubo conversion.

        // Split the accumulated input string by spaces into an array of strings.
        nums   =   input   .   split   (   ' '   )   ;

        // Parse the first element of the 'nums' array into an integer (base 10) and assign to 'a'.
        a   =   parseInt   (   nums   [   0   ]   ,   10   )   ;

        // Parse the second element of the 'nums' array into an integer (base 10) and assign to 'b'.
        b   =   parseInt   (   nums   [   1   ]   ,   10   )   ;

        // Calculate the result: (a multiplied by b) divided by TSUBO, and print it to the console.
        console   .   log   (   a   *   b   /   TSUBO   )   ;
    }


    // Ensure the standard input stream is active and ready to receive data.
    process   .   stdin   .   resume   ( )   ;

    // Set the character encoding for the standard input stream to 'utf8'.
    process   .   stdin   .   setEncoding   (   'utf8'   )   ;

    // Attach an event listener for 'data' events on the standard input stream.
    // Each time a chunk of data is received, it is appended to the 'input' variable.
    process   .   stdin   .   on   (   'data'   ,   function   (   chunk   )   {
        input   +=   chunk   ;   // Concatenate the new chunk of data to the existing input.
    }   )   ;


    // Attach an event listener for the 'end' event on the standard input stream.
    // This event fires when there is no more data to be read from stdin.
    process   .   stdin   .   on   (   'end'   ,   function   ( )   {
        // This line performs a split operation but its result is not used.
        // It's part of the original code and preserved as-is.
        input   .   split   (   '\n'   )   ;

        // Once all input has been received, invoke the main processing function.
        main   ( )   ;
    }   )   ;
}   ( ) )   ; // The IIFE is immediately invoked.