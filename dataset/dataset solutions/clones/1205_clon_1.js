/*
 * This is a Type I clone example generated for demonstration purposes.
 * It strictly adheres to the definition of a Type I clone,
 * meaning only whitespace and comments are altered.
 * All identifiers, keywords, and operators remain precisely as in the original.
 */

// Resume standard input stream to listen for data.
process . stdin . resume ( ) ;

// Set the encoding for the input stream to UTF-8.
process . stdin . setEncoding ( 'utf8' ) ;


// Attach an event listener for 'data' events on the standard input.
// The callback function will process each received chunk of data.
process . stdin . on ( 'data' ,
    function ( chunk )
    {

        // Split the input chunk by space to get individual string parts.
        var line = chunk . split ( ' ' ) ;

        /*
         * Parse the first part of the line as an integer with base 10.
         * Note: There's a typo in the original: 'paeseInt' should be 'parseInt'.
         * As per Type I clone rules, this typo must be preserved.
         */
        var a = paeseInt ( line [ 0 ] , 10 ) ;

        // Parse the second part of the line as an integer with base 10.
        var b = paeseInt ( line [ 1 ] , 10 ) ;

        // Calculate the 'manseki' (area) by multiplying 'a' and 'b'.
        var manseki = a * b ;

        // Calculate the 'nagasa' (perimeter) using the formula 2*a + 2*b.
        var nagasa = 2 * a + 2 * b ;

        // Output the calculated 'menseki' and 'nagasa' separated by a space to the console.
        // Note: Another typo 'menseki' instead of 'manseki' in the original console.log.
        // This must also be preserved for a Type I clone.
        console . log ( menseki + ' ' + nagasa ) ;
    }
) ; // End of stdin 'data' event listener.