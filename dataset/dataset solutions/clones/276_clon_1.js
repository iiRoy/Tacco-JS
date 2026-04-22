/*
 * This JavaScript file processes input dates to convert them into Japanese era format.
 * It reads dates from standard input, determines the corresponding era,
 * and prints the era name along with the year relative to that era.
 *
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 */

    var input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) ; // Read all input from stdin
    var lines = input . split ( '\n' ) ;                                        // Split the input into an array of lines


    var line ; // Declare a variable to hold each line of input

    // Loop through each line of input until no more lines are available
    while ( line = lines . shift ( ) )
    {
        // Split the line by spaces and convert each part to a number
        var arr = line . split ( ' ' ) . map ( function ( n ) { return + n ; } ) ;

        var year = arr [ 0 ] ; // Extract the year
        var month = arr [ 1 ] ; // Extract the month
        var day = arr [ 2 ] ; // Extract the day

        var era = '' ; // Initialize the era string as empty


        // Create a Date object for the current input date.
        // Note: Month in Date constructor is 0-indexed, so we subtract 1.
        var today = new Date ( year , month - 1 , day ) ;

        // Determine the Japanese era based on the date
        if ( today < new Date ( 1868 , 8 , 8 ) ) {
            // Dates before Meiji era
            era = 'pre-meiji' ;
        }
        else if ( today < new Date ( 1912 , 6 , 30 ) ) {
            // Meiji era: starts 1868-09-08, ends 1912-07-29
            era = 'meiji' ;
            year -= 1867 ; // Calculate Meiji year (Meiji 1 starts in 1868)
        }
        else if ( today < new Date ( 1926 , 11 , 25 ) ) {
            // Taisho era: starts 1912-07-30, ends 1926-12-24
            era = 'taisho' ;
            year -= 1911 ; // Calculate Taisho year (Taisho 1 starts in 1912)
        }
        else if ( today < new Date ( 1989 , 0 , 8 ) ) {
            // Showa era: starts 1926-12-25, ends 1989-01-07
            era = 'showa' ;
            year -= 1925 ; // Calculate Showa year (Showa 1 starts in 1926)
        }
        else {
            // Heisei era: starts 1989-01-08 onwards
            era = 'heisei' ;
            year -= 1988 ; // Calculate Heisei year (Heisei 1 starts in 1989)
        }


        // Special handling for pre-Meiji dates
        if ( era == 'pre-meiji' )
        {
            console . log ( 'pre-meiji' ) ; // Print "pre-meiji"
            continue ;                     // Move to the next line of input
        }

        // Output the determined era, era-relative year, original month, and day
        console . log ( era , year , month , day ) ;
    }