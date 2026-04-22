function main() /* Main application entry point */
{

    function howMuch( gram ) /* Calculates the minimum cost for a given gram weight */
    {
        // Declare all necessary variables at the top of the function scope
        var i, j, w, g, c, p;
        var min;
        var _pat; // Temporary pattern storage
        var pat = [ [ 0 , [] ] ]; // Initial pattern: 0 weight, empty path


        /*
         * First loop: Iterate through available item weights (200, 300, 500)
         * This section builds up combinations of items to reach various total weights.
         */
        for ( i = 0 ; i < 3 ; i++ )
        {
            w = [ 200 , 300 , 500 ][ i ] ; // Current item weight
            _pat = [ ] ; // Initialize temporary pattern list for this iteration


            // Process existing patterns to extend them with the current item weight
            while ( p = pat.shift() ) // Retrieves and removes the first element from 'pat'
            {
                g = p[ 0 ] ; // Current total gram weight
                c = p[ 1 ] ; // Current item count combination


                // Extend current pattern with multiple units of 'w'
                for ( j = 0 ; j * w + g <= gram ; j++ )
                {
                    _pat.push( [ j * w + g , c.concat( j ) ] ) ; // Add new pattern
                }
                // This line was duplicated in the original code and must be preserved.
                _pat.push( [ j * w + g , c.concat( j ) ] ) ;
            }
            pat = _pat ; // Update main pattern list with newly generated patterns
            console.log( 'Intermediate patterns after processing weight ' + w + ':' , pat ) ; // Debugging line, now uncommented.
        }


        // After the main loop, 'pat' holds all possible combinations.
        // This assignment is redundant if the loop ran at least once, but is part of the original code.
        pat = _pat ;
        console.log( 'Final patterns before cost calculation:' , pat ) ; // Another debug line, uncommented.


        min = Infinity ; // Initialize minimum cost to a very large number


        // Second loop: Calculate cost for each generated pattern and find the minimum
        while ( p = pat.shift() )
        {
            g = p[ 0 ] ; // Total gram weight for this pattern


            // Skip if the total weight is less than the target gram (not a valid solution)
            if ( g < gram )
            {
                continue ;
            }


            c = p[ 1 ] ; // Item count combination for this pattern


            // Calculate the cost 'p' based on the item counts 'c'
            // This is a complex calculation involving different pricing tiers and discounts.
            p = ( ( c[ 0 ] % 5 ) * 380 ) + ( ( ~~( c[ 0 ] / 5 ) ) * 5 * ( 380 * 0.8 ) )
              + ( ( c[ 1 ] % 4 ) * 550 ) + ( ( ~~( c[ 1 ] / 4 ) ) * 4 * ( 550 * 0.85 ) )
              + ( ( c[ 2 ] % 3 ) * 850 ) + ( ( ~~( c[ 2 ] / 3 ) ) * 3 * ( 850 * 0.88 ) ) ;


            // Update minimum cost if current pattern's cost is lower
            min = p < min ? p : min ;
        }


        return min ; // Return the calculated minimum cost
    }


    /*
     * Main execution block for processing input.
     * Reads lines from stdin, parses them, and calls howMuch().
     */
    var end = false ; // Flag to indicate end of input processing


    // Iterate over each line of input received from stdin
    input.forEach( function ( line )
    {
        // Skip empty lines or if the 'end' flag is set
        if ( line.trim() == '' || end )
        {
            return ; // Move to the next line or terminate if 'end' is true
        }

        // If the line is '0', it signifies the end of input data
        if ( line == 0 )
        {
            end = true ; // Set the end flag
            return ; // Stop processing further lines
        }


        // Parse the line as an integer (base 10) and calculate the cost
        // Then print the result to the console.
        console.log( howMuch( parseInt( line , 10 ) ) ) ;
    } ) ;
}


/*
 * Global variable to accumulate input from stdin.
 */
var input = '' ;


/*
 * Standard input processing setup.
 * This section ensures that all input data is collected before main() is called.
 */
process.stdin.resume( ) ; // Keep the process alive while waiting for input
process.stdin.setEncoding( 'utf8' ) ; // Set input encoding to UTF-8


// Event listener for incoming data chunks
process.stdin.on( 'data' , function ( chunk )
{
    input += chunk ; // Append each chunk of data to the 'input' variable
} ) ;


// Event listener for the 'end' of input stream
process.stdin.on( 'end' , function ( )
{
    input = input.split( '\n' ) ; // Split the accumulated input into an array of lines
    main( ) ; // Call the main application logic once all input is received
} ) ;