/* This entire script is encapsulated within a self-executing anonymous function. */
( function ( ) {

    // Define the primary function responsible for processing the input.
    function   Main (   input   )
    {

        /*
         * The input string is expected to contain multiple lines.
         * We are specifically interested in the very first line for processing.
         * This line is extracted and assigned to the 'lines' variable.
         */
        lines   =   input .   split ( "\n" ) [ 0 ]


        // Initialize a counter 'j' to keep track of occurrences of a specific character.
        j   =   0


        // Begin an iterative process to scan through each character of the 'lines' string.
        for   (   i   =   0 ;   i   <   lines .   length ;   i ++   )
        {
            // Inside the loop: check if the current character at index 'i' is exactly 'x'.
            if   (   lines [ i ]   ==   'x'   )
            {
                // If the character matches 'x', increment our counter 'j'.
                j ++
            }
        } // End of the character iteration loop.


        /*
         * After counting all 'x's, we evaluate the total count 'j'.
         * The decision logic is based on whether 'j' is greater than or equal to 8.
         */
        if   (   j   >=   8   )
        {
            // If the count of 'x's is 8 or more, output "NO" to the console.
            console .   log ( 'NO' )
        }
        else
        {
            // Otherwise (if 'j' is less than 8), output "YES" to the console.
            console .   log ( 'YES' )
        }

    } // End of the Main function definition.


    /*
     * This section invokes the 'Main' function.
     * It reads the entire content of the standard input file (/dev/stdin)
     * using Node.js's 'fs' module, specifically 'readFileSync'.
     * The file content is read as UTF-8 encoded text and then passed
     * as the 'input' argument to the 'Main' function for processing.
     */
    Main (   require ( "fs" ) .   readFileSync ( "/dev/stdin" ,   "utf8" )   ) ;

} ( ) ) // The self-executing anonymous function concludes here.