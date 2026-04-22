// This is a utility function to print output to the console.
function myout( text )
{
    console.log( text ); // Standard output mechanism for this application.
}

/*
 * Main function responsible for processing the input and generating the final result.
 * It takes the raw input string, parses it, performs calculations, and then outputs the result.
 */
function Main(  input  )
{
    // Clean up the input string by removing leading/trailing whitespace.
    input = input.trim();


    // The following lines demonstrate alternative input parsing strategies, currently commented out.
    // input = input.trim().split(" "); // Example: Split by space
    input = input.trim().split( "\n" ); // Current strategy: Split by newline

    // input = input.trim().split(" ").map((a)=>Number(a));    // Example: Split by space and convert to numbers
    // input = input.trim().split("\n").map((a)=>Number(a));   // Example: Split by newline and convert to numbers

    // Parse the length from the first line of the input.
    var len = parseInt( input[0] );


    // Parse the list of numbers from the second line of the input.
    // It's expected to be space-separated values.
    var list = input[1].split( " " ).map( (a) => Number(a) );


    // Initialize an object to keep track of counts for each number.
    var checked = {};


    // First processing loop: Count occurrences of each number in the list.
    for ( var i = 0 ;  i < len ; i++ )
    {
        // If the number has not been encountered before, initialize its count to 1.
        if ( checked[ list[i] ] == null )
        {
            checked[ list[i] ] = 1 ;
        }
        // If the number has been encountered once, increment its count.
        else if ( checked[ list[i] ] == 1 )
        {
            checked[ list[i] ]++;
        }
    }


    /*
     * This block contains commented-out logic for handling specific 'len' values.
     * It's currently disabled but kept for potential future use or reference.
     */
    /*
     if ( len == 1 )
     {
     myout( 1 );
     return;
     }
     else if ( len == 2 )
     {
     myout( 2 );
     return;
     }
     */


    // myout(checked); // Debugging line to output the 'checked' object, currently disabled.


    // Sort the list of numbers in ascending order.
    list.sort();


    // Filter out duplicate numbers from the list, keeping only unique values.
    list = list.filter( function ( x, i, self )
    {
        return self.indexOf( x ) === i ;
    } );


    // Initialize the output variable, which will store the final calculated result.
    var output = 1 ;


    // Second processing loop: Validate conditions based on unique numbers and their counts.
    for ( var i = 0 ; i < list.length ; i++ )
    {
        // Special handling for odd length 'len' and the number '0'.
        if ( ( len % 2 == 1 ) && ( list[i] == 0 ) )
        {
            // If '0' appears more or less than once, it's an invalid state.
            if ( checked[ list[i] ] != 1 )
            {
                myout( "0" ); // Output "0" and terminate.
                return;
            }
            continue; // Move to the next number in the list.
        }

        // For all other numbers (or even 'len'), check if their count is exactly 2.
        if ( checked[ list[i] ] != 2 )
        {
            myout( "0" ); // If not 2, output "0" and terminate.
            return;
        }
    }


    // If 'len' is odd, remove the first element from the 'list' (which should be 0 if conditions passed).
    if ( len % 2 == 1 )
    {
        list.shift();
    }


    // Calculate the final output using Math.pow(2, list).
    // Note: The original code used 'list' directly as the exponent, which is preserved as per Type I clone definition.
    output *= Math.pow( 2 , list ) ;


    // Output the final calculated result.
    myout( output ) ;
}


// --- Program Entry Point ---
// Read input from standard input (/dev/stdin) using Node.js 'fs' module
// and pass it to the Main function for processing.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;