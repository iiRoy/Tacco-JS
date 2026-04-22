/*
 * This JavaScript function processes an input string to calculate a specific value.
 * It's designed to illustrate Type I code cloning by extensively modifying
 * whitespace and adding comments, while keeping the core logic identical.
 */
function   Main ( input )
{
    // Declare and initialize variables needed for processing.
    var   N          =   input.length;   // Original length of the input string.
    var   list;                          // To hold parts of the input as an array of characters.
    var   color      =   0;              // A 'color' state, toggling between 0 and 1.
    var   ans        =   0;              // The final answer to be calculated.
    var   count      =   0;              // Counter for specific conditions.
    var   check      =   0;              // Control flag for the processing loop.
    var   S;                             // Array to store parsed integer values.
    var   Norg       =   N;              // Store the initial 'N' value, as 'N' will change.
    var   Size       =   10;             // Defines the chunk size for processing the input.


    // Main processing loop: continues until the 'check' flag is set to 1.
    while ( check   ==   0 )
    {

        // Extract a chunk of the input string, convert it to an array of characters.
        list     =   input.substr ( 0, Size ) . split ( "" );

        // Update 'N' to the length of the current chunk.
        N        =   list.length;

        // Initialize a new array 'S' to hold integer representations.
        S        =   new   Array ( N );

        // Loop through the character list and parse each character into an integer.
        for ( i = 0 ;   i < N ;   i ++ )
        {
            S [ i ]   =   parseInt ( list [ i ] ) ;
        }


        // Second loop: iterate through the parsed integers to update 'count' and 'color'.
        for ( i = 0 ;   i < N ;   i ++ )
        {
            // If the current integer matches the 'color' state, increment 'count'.
            if ( S [ i ]   ==   color )
            {
                count ++;
            }

            // Toggle the 'color' state (0 becomes 1, 1 becomes 0).
            color   =   ( color   +   1 ) % 2 ;
        }


        // Check if there's more input to process beyond the current chunk size.
        if ( input.length   >   Size )
        {
            // If yes, slice the processed part from the input string.
            input   =   input.slice ( Size ) ;
        }
        else
        {
            // If no, set the 'check' flag to 1 to exit the while loop.
            check   =   1 ;
        }

    } // End of the main processing while loop.


    // Calculate the final answer based on the total original length and the accumulated count.
    if ( Norg   -   count   >   count )
    {
        ans   =   count ;
    }
    else
    {
        ans   =   Norg   -   count ;
    }


    // Output the calculated answer to the console.
    console.log ( ans ) ;

} // End of the Main function definition.


// Call the Main function with input read from standard input.
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" )   ) ;