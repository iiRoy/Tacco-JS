/*
 *   This JavaScript program is designed to read three space-separated integers
 *   from standard input. It then determines if the third integer (C)
 *   falls within the inclusive range defined by the first (A) and second (B)
 *   integers. The result, "Yes" or "No", is printed to standard output.
 *
 *   This is a Type I clone, preserving all original identifiers and logic,
 *   with modifications only to whitespace and comments for visual distinction.
 */


        process . stdin . resume ( ) ; // Initializes the standard input stream, making it ready to receive data.


        process . stdin . setEncoding ( 'utf8' ) ; // Configures the standard input stream to interpret incoming data as UTF-8 encoded text.


        /*
         *   Establishes an event listener for the 'data' event on the standard input stream.
         *   This function will execute whenever new data is available from stdin.
         *   The incoming data is provided as a 'chunk' argument.
         */
        process . stdin . on ( 'data' ,   function   (   chunk   )
        {
          // Converts the incoming data chunk to a string, then splits it into an array
          // of substrings using a space character as the delimiter.
          var   lines   =   chunk . toString ( ) . split ( ' ' ) ;


          // Parses the first element of the 'lines' array into an integer and assigns it to variable A.
          var   A   =   parseInt ( lines [ 0 ] ) ;


          // Parses the second element of the 'lines' array into an integer and assigns it to variable B.
          var   B   =   parseInt ( lines [ 1 ] ) ;


          // Parses the third element of the 'lines' array into an integer and assigns it to variable C.
          var   C   =   parseInt ( lines [ 2 ] ) ;


          /*
           *   Conditional check:
           *   Determines if C is greater than or equal to A AND C is less than or equal to B.
           *   This effectively checks if C lies inclusively between A and B.
           */
          if   (   A   <=   C   &&   C   <=   B   )
          {
            // If the condition is true, output "Yes" to the console.
            console . log ( "Yes" ) ;
          }
          else
          {
            // If the condition is false, output "No" to the console.
            console . log ( "No" ) ;
          }

        } ) ; // End of the 'data' event handler function.