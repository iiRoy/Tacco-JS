/*
 * This is a Type I clone of the original JavaScript code.
 * It demonstrates extensive modifications to whitespace and comments
 * while preserving the exact structure and identifiers.
 */
function   main ( )
{
    // Declare all necessary variables at the beginning of the function scope.
    var
            i, j, n, m,
            table, line, str;


    /*
     * The main processing loop.
     * It continues as long as parseInt(input[i++], 10) returns a truthy value for 'n'.
     * 'n' represents the number of entries in the current translation table.
     */
    for ( i = 0 ;   n = parseInt ( input [ i++ ] ,   10 ) ; )
    {
        // Initialize an empty object to serve as our translation table.
        table =    { } ;

        // Loop 'n' times to populate the translation table.
        for ( j = 0 ;   j < n ; j++ )
        {
            // Read a line from input, split it by space, and store it.
            line = input [ i++ ] . split ( ' ' ) ;

            // Populate the table: key is line[0], value is line[1].
            table [ line [ 0 ] ]   =   line [ 1 ] ;
        }


        // Read the number of strings to be translated or processed, assign to 'm'.
        m = parseInt ( input [ i++ ] , 10 ) ;

        // Initialize an empty array to store the resulting strings.
        str = [ ] ;

        /*
         * Loop 'm' times to process the input strings.
         * Note the double increment: 'j' for loop count, 'i' for input array index.
         */
        for ( j = 0 ; j < m ; j++ , i++ )
        {
            // Push either the translated string from 'table' or the original string if no translation exists.
            str . push ( table [ input [ i ] ] || input [ i ] ) ;
        }

        // Output the joined strings to the console.
        console . log ( str . join ( '' ) ) ;
    }
}


// Global variable to store all input data.
var
        input = '' ;


// Resume standard input stream.
process . stdin . resume ( ) ;


// Set the encoding for the standard input stream.
process . stdin . setEncoding ( 'utf8' ) ;


/*
 * Event listener for 'data' chunks from stdin.
 * Appends each chunk to the 'input' variable.
 */
process . stdin . on ( 'data' ,   function ( chunk )
{
    input += chunk ;
} ) ;


/*
 * Event listener for 'end' of stdin.
 * Splits the accumulated input into an array of lines and then calls the main function.
 */
process . stdin . on ( 'end' , function ( )
{
    input = input . split ( / \r\n | \r | \n / g ) ;
    main ( ) ;
} ) ;