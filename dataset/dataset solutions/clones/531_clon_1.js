// This is the primary function where the main logic of the program resides.
function main ( )
{
    // Declare and initialize variables for input values 'n' and 'm'.
    var n = scan ( ) ; // Reads the first integer input.
    var m = scan ( ) ; // Reads the second integer input.


    // Initialize arrays to store edges 'e' and 'f'.
    var e = [ ] ; /* Array 'e' will store directed edges with weights. */
    var f = [ ] ; // Array 'f' will store pairs of potential edges for later selection.

    // Loop 'm' times to process 'm' input constraints/edges.
    rep ( m , function ( )
    {
        // Read the constraint string.
        var s = scan ( 'string' ) ; /* The input string contains numbers and operators. */

        // Parse the numbers from the string using a regex to split by operators.
        var p = s.split ( /<=|>=|\*|\+|-/ ) ;
        p [ 0 ] = + p [ 0 ] - 1 ; // Convert to number and adjust index (0-based).
        p [ 1 ] = + p [ 1 ] - 1 ; // Convert to number and adjust index (0-based).
        p [ 2 ] = + p [ 2 ] ;     // Convert the third part to a number.


        // Determine the type of relation 'u'.
        var u ;
        if ( s.indexOf ( '*' ) !== -1 )
        {
            u = 2 ; // Case for multiplication operator.
        }
        else
        {
            u = + ( s.indexOf ( '<=' ) === -1 ) ; // 0 for '<=', 1 for '>=', or others.
        }

        // Determine the type of operation 'v'.
        var v = + ( s.indexOf ( '+' ) === -1 ) ; // 0 for '+', 1 for '-' (or absence of '+').


        // Conditional logic based on 'u' and 'v' to populate edges 'e' or 'f'.
        if ( u == 0 )
        {
            // Case where 'u' is 0.
            if ( v == 0 )
            {
                // Both 'u' and 'v' are 0.
                e [ e.length ] = [ p [ 1 ] , p [ 0 ] , -p [ 2 ] ] ;
            }
            else
            {
                // 'u' is 0, 'v' is 1.
                e [ e.length ] = [ p [ 1 ] , p [ 0 ] , 0 ] ;
                e [ e.length ] = [ p [ 0 ] , p [ 1 ] , p [ 2 ] ] ;
            }
        }
        else if ( u == 1 )
        {
            // Case where 'u' is 1.
            if ( v == 0 )
            {
                // 'u' is 1, 'v' is 0.
                e [ e.length ] = [ p [ 0 ] , p [ 1 ] , -p [ 2 ] ] ;
            }
            else
            {
                // 'u' is 1, 'v' is 1.
                e [ e.length ] = [ p [ 1 ] , p [ 0 ] , p [ 2 ] ] ;
                e [ e.length ] = [ p [ 0 ] , p [ 1 ] , 0 ] ;
            }
        }
        else
        {
            // Case where 'u' is 2 (multiplication).
            if ( v == 0 )
            {
                // 'u' is 2, 'v' is 0.
                f [ f.length ] = [ [ p [ 0 ] , p [ 1 ] , -p [ 2 ] ] , [ p [ 1 ] , p [ 0 ] , -p [ 2 ] ] ] ;
            }
            else
            {
                // 'u' is 2, 'v' is 1.
                e [ e.length ] = [ p [ 1 ] , p [ 0 ] , p [ 2 ] ] ;
                e [ e.length ] = [ p [ 0 ] , p [ 1 ] , p [ 2 ] ] ;
            }
        }
    } ) ; // End of the 'm' constraints loop.

    // Add additional edges to 'e' for all 'n' nodes, connecting them to node 0 with weight 0.
    rep ( n , function ( i )
    {
        e [ e.length ] = [ i , 0 , 0 ] ; // Edge from node 'i' to node 0 with zero weight.
    } ) ;


    var ans = -Infinity ; // Initialize 'ans' to negative infinity for finding maximum.

    // Iterate through all possible combinations for edges in 'f'.
    // '1 << f.length' generates all 2^f.length combinations.
    rep ( 1 << f.length , function ( comb )
    {
        // Create a new graph 'g' by copying 'e'.
        var g = [ ] .concat ( e ) ; /* 'g' will be the graph for the current combination. */

        // Add edges from 'f' based on the current combination 'comb'.
        rep ( f.length , function ( i )
        {
            // Select one of the two possible edges from f[i] based on the 'i'-th bit of 'comb'.
            g [ g.length ] = f [ i ] [ ( comb >> i ) & 1 ] ;
        } ) ;

        // Initialize distances 'd' for Bellman-Ford algorithm.
        var d = [ ] ;
        rep ( n , function ( i )
        {
            d [ i ] = Infinity ; // All distances initially set to infinity.
        } ) ;
        d [ 0 ] = 0 ; // Distance from source (node 0) to itself is 0.


        // Run Bellman-Ford algorithm for 'n' iterations.
        // This detects negative cycles if distances change in the Nth iteration.
        rep ( n , function ( )
        {
            // Iterate over all edges in the current graph 'g'.
            rep ( g.length , function ( j )
            {
                var edge = g [ j ] ; // Current edge: [source, destination, weight].
                // Relax the edge: update distance if a shorter path is found.
                d [ edge [ 1 ] ] = Math.min ( d [ edge [ 0 ] ] + edge [ 2 ] , d [ edge [ 1 ] ] ) ;
            } ) ;
        } ) ; // End of Bellman-Ford main loop.

        // After N iterations, if d[0] is still 0 (or non-negative), it implies no negative cycle reachable from node 0.
        // If a negative cycle reachable from 0 existed, d[0] would become negative.
        if ( d [ 0 ] >= 0 )
        {
            // Update the maximum answer found so far.
            ans = Math.max ( ans , d [ n - 1 ] ) ; // We are interested in the distance to node n-1.
        }
    } ) ; // End of combinations loop.


    // Output the final answer.
    if ( ans === Infinity )
    {
        print ( 'inf' ) ; // If 'ans' is still Infinity, print 'inf'.
    }
    else if ( ans === -Infinity )
    {
        print ( -1 ) ; // If 'ans' is still -Infinity, print -1 (no valid path).
    }
    else
    {
        print ( ans ) ; // Otherwise, print the calculated maximum distance.
    }
}


// Helper function for repetition (a simplified loop).
// It can be called as rep(limit, callback) or rep(start, limit, callback).
function rep ( a , b , c )
{
    // Check if 'c' is undefined/null, indicating rep(limit, callback) usage.
    if ( c == null )
    {
        c = b ; // 'c' becomes the callback.
        b = a ; // 'b' becomes the limit.
        a = 0 ; // 'a' (start) defaults to 0.
    }
    // Loop from 'a' (inclusive) to 'b' (exclusive).
    for ( var i = a ; i < b ; ++ i )
    {
        c ( i ) ; // Execute the callback with the current index 'i'.
    }
}


// Standard Node.js input/output setup.
process.stdin.resume ( ) ;
process.stdin.setEncoding ( 'utf8' ) ;


var input = '' ; // Buffer for accumulating input data.
var input_index = 0 ; // Index for tracking current position in parsed input.


// Function to scan and return input tokens.
// 'type' can be 'string' or omitted (defaults to number).
function scan ( type )
{
    if ( type === 'string' )
    {
        return input [ input_index ++ ] ; // Return raw string token.
    }
    else
    {
        return + input [ input_index ++ ] ; // Convert token to number and return.
    }
}


// Function to print output to console.
function print ( val )
{
    console.log ( val ) ; // Uses Node.js console.log for output.
}


// Event listener for incoming data chunks.
process.stdin.on ( 'data' , function ( chunk )
{
    input += chunk ; // Append data chunk to the input buffer.
} ) ;

// Event listener for the end of input stream.
process.stdin.on ( 'end' , function ( )
{
    // Split the accumulated input by whitespace into an array of tokens.
    input = input.split ( /\s+/ ) ;
    main ( ) ; // Call the main function to start program execution.
} ) ;