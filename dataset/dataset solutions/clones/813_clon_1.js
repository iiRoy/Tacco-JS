/*
 * This script reads input from standard input, processes it,
 * and prints an answer to standard output.
 * It appears to be solving a problem related to infection spread.
 */

// Import the 'fs' (file system) module to read data.
var data = require ( 'fs' ) . readFileSync ( '/dev/stdin', 'utf8' ) ;

// Trim leading/trailing whitespace from the input data and split it into an array of lines.
var input = data . trim ( ) . split ( "\n" ) ;

// Initialize a line counter to keep track of the current line being processed from the input array.
var line = 0 ;

// Main processing loop. It continues indefinitely until a specific break condition is met.
while ( true )
{
    // Read the current line, split it by whitespace, and convert parts to numbers.
    var nm = input [ line ] . split ( /\s+/ ) . map ( Number ) ;

    // Increment the line counter for the next iteration.
    line ++ ;

    // Extract 'n' and 'm' values from the parsed numbers.
    var n = nm [ 0 ] ;
    var m = nm [ 1 ] ;

    // Check for the termination condition: if both n and m are zero, exit the loop.
    if ( n == 0 && m == 0 )
    {
        break ; // Terminate the while loop.
    }

    /*
     * Initialize an array to track the infection status of 'n' entities.
     * By default, all are considered infected (true).
     */
    var infected = [ ] ;

    // Populate the 'infected' array.
    for ( var i = 0 ; i < n ; i ++ )
    {
        infected [ i ] = true ; // Mark all entities as initially infected.
    }

    // Explicitly mark the first entity (index 0) as not infected.
    infected [ 0 ] = false ;

    // Initialize an array to store time-sorted data (tsd) packets.
    var tsd = [ ] ;

    // Loop 'm' times to read 'm' packets of information.
    for ( var i = 0 ; i < m ; i ++ )
    {
        // Read a packet, split by whitespace, and convert to numbers.
        var packet = input [ line ] . split ( /\s+/ ) . map ( Number ) ;

        // Increment the line counter.
        line ++ ;

        /*
         * Store the packet information:
         * packet[0] is time, packet[1] and packet[2] are entity indices.
         * Subtract 1 from entity indices to convert them to 0-based.
         */
        tsd . push ( [ packet [ 0 ] , packet [ 1 ] - 1 , packet [ 2 ] - 1 ] ) ;
    }

    // Sort the 'tsd' array based on the first element (time).
    tsd . sort ( function ( a , b )
    {
        return a [ 0 ] - b [ 0 ] ; // Sort in ascending order of time.
    } ) ;

    /*
     * Iterate through the sorted packets and update infection status.
     * This simulates the spread of infection over time.
     */
    tsd . forEach ( function ( packet )
    {
        // Extract the two entity indices from the current packet.
        var a = packet [ 1 ] ;
        var b = packet [ 2 ] ;

        // If entity 'a' is NOT infected, then entity 'b' also becomes NOT infected.
        if ( ! infected [ a ] )
        {
            infected [ b ] = false ;
        }
    } ) ;

    // Initialize a counter for the final answer.
    var answer = 0 ;

    // Count the number of entities that are not infected.
    infected . forEach ( function ( packet )
    {
        // If the entity's status is 'false' (not infected), increment the answer.
        if ( ! packet )
        {
            answer ++ ;
        }
    } ) ;

    // Print the final calculated answer to the console.
    console . log ( answer ) ;

} // End of the main while loop.