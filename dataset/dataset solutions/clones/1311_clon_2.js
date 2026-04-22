// This immediately invoked function expression (IIFE) processes input data.
(  function ( rawData )   {
    // Split the entire raw input string into individual line segments.
    // Each segment represents a line from the standard input.
    var lineSegments = rawData .  split ( '\n' ) ;

    // Iterate through each of the extracted line segments.
    for ( let currentIdx = 0 ; currentIdx < lineSegments . length ; ++ currentIdx ) {
        // Convert the current line segment from a string to an integer.
        // The radix (base 10) is explicitly specified for clarity and robustness.
        let numericValue = parseInt ( lineSegments [ currentIdx ] , 10 ) ;

        // If the processed numeric value is zero,
        // it signifies the end of the input sequence, so terminate execution.
        if ( numericValue === 0 )
        {
            return ; // Exit the anonymous function.
        }

        // Calculate the sum of the digits for the current numeric value.
        // First, convert the number back to a string, then split it into individual character digits.
        // Map each character digit back to a number, and finally reduce them by summing.
        console . log (
            String ( numericValue )
                . split ( '' ) // Convert number to string, then split into array of digit characters
                . map ( charDigit => parseInt ( charDigit , 10 ) ) // Convert each character digit to a number
                . reduce (
                    ( accumulator , currentDigit ) => {
                        return accumulator + currentDigit ; // Sum up the digits
                    }
                )
        ) ;
    }
} ) (
    // Read the entire content of standard input synchronously.
    // Specify UTF-8 encoding for text interpretation.
    require ( 'node:fs' ) . readFileSync ( '/dev/stdin' , { encoding : 'utf8' } )
) ;