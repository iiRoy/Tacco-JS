/*
 * This is a Type I clone generated from an original JavaScript source.
 * The purpose is to demonstrate extensive whitespace and comment variations
 * while preserving the exact semantic structure and identifiers.
 */

function   main  (  ) {
    // Declare some fundamental character codes for later use in transformations.
    var

        a   =   'a' . charCodeAt ( 0 )  ,
        t   =   't' . charCodeAt ( 0 )  ,
        z   =   'z' . charCodeAt ( 0 )  ;


    /**
     * Helper function 's' performs a character shift operation.
     * It handles spaces and periods by returning them unchanged.
     * For other characters, it shifts them by 'n' positions.
     * If the shifted character goes beyond 'z', it wraps around from 'a'.
     *
     * @param   {string}    c   The character to shift.
     * @param   {number}    n   The shift amount.
     * @returns {string}        The shifted character.
     */
    function   s   (   c   ,   n   )   {
        if   (   c   ===   ' '   ||   c   ===   '.'   )   {
            return   c   ;
        }

        // Convert character to its ASCII/Unicode code.
        c   =   c . charCodeAt ( 0 )   ;

        // Apply the shift.
        c   -=   n   ;

        // Handle wrap-around for characters that go past 'z'.
        // This ensures the character stays within the 'a'-'z' range.
        return   String . fromCharCode   (   c   >   z   ?   a   +   c   -   z   :   c   )   ;
    }


    /**
     * Helper function 'd' calculates a numerical value based on a character.
     * This value is derived from the character's position relative to 't'.
     * It handles negative results by wrapping around in a specific way.
     *
     * @param   {string}    c   The input character.
     * @returns {number}        The calculated numerical value.
     */
    function   d   (   c   )   {
        // Calculate the difference from 't'.
        c   =   c . charCodeAt ( 0 )   -   t   ;

        // If the result is negative, adjust it using 'z' and 't'.
        return   c   <   0   ?   (   z   -   t   )   +   -c   :   c   ;
    }

    // Process each line of the input data.
    input . forEach   (   function   (   line   )   {
        // Declare local variables for the processing of each line.
        var

            n   ,   words   ;

        // Skip processing if the line is empty or contains only whitespace.
        if   (   line . trim ( )   ===   ''   )   {
            return   ;
        }

        // The following line was commented out in the original, keeping it commented.
        // console.log(line);

        // Split the line into words using space or period as delimiters.
        words   =   line . split   (   / [ \.] / g   )   ;

        // Iterate through each word to find a matching transformation.
        for   (   i   =   0   ;   i   <   words . length   ;   i   ++   )   {
            // Calculate the shift value 'n' for the current word.
            n   =   d   (   words [ i ]   )   ;

            // Apply the shift to the current word and check if it matches a target keyword.
            if   (   words [ i ] . split ( '' ) . map ( function ( c ) {
                return   s   (   c   ,   n   )   ;
            } ) . join ( '' )   in   {   'the'   :   0   ,   'this'   :   0   ,   'that'   :   0   }   )   {
                // If a match is found, break the loop as we've identified the correct 'n'.
                break   ;
            }
        }

        // Another commented out line from the original, retained as-is.
        // console.log(n);

        // After determining 'n', apply the final transformation to the entire line
        // and print the result to the console.
        console . log   (   line . split ( '' ) . map ( function ( c ) {
            return   s   (   c   ,   n   )   ;
        } ) . join ( '' )   )   ;
    }   )   ;
}


// Global variable to store all incoming standard input data.
var

    input   =   ''   ;


// Resume standard input stream to start receiving data.
process . stdin . resume ( )   ;

// Set the encoding for the standard input data.
process . stdin . setEncoding ( 'utf8' )   ;

// Event listener for incoming data chunks.
process . stdin . on   (   'data'   ,   function   (   chunk   )   {
    // Append each received chunk to the 'input' variable.
    input   +=   chunk   ;
}   )   ;

// Event listener for the end of the standard input stream.
process . stdin . on   (   'end'   ,   function   (   )   {
    // Once all data is received, split it into lines.
    input   =   input . split   (   '\n'   )   ;

    // Call the main function to process the input.
    main ( )   ;
}   )   ;