/*
 * This JavaScript file processes input from standard input to solve a specific problem.
 * It reads data, parses it, performs calculations based on infection spread, and outputs a result.
 */

// Retrieve the file system module to read data.
var    data    =    require ( 'fs' ) . readFileSync ( '/dev/stdin' ,    'utf8' ) ;
// The 'fs' module is essential for file operations.
// readFileSync is used for synchronous file reading.

/*
 * Process the raw input data.
 * Trim any leading/trailing whitespace and split the content into an array of lines.
 */
var    input    =    data . trim ( ) . split ( "\n" ) ;

// Initialize a line counter for iterating through the input array.
var    line    =    0 ;

/*
 * Main processing loop.
 * This loop continues indefinitely until a specific break condition is met.
 */
while    (    true    )
{

    // Read the current line, split it by space, and convert parts to numbers.
    var    nm    =    input [ line ] . split ( " " ) . map ( Number ) ;

    // Increment the line counter to move to the next line for subsequent reads.
    line    ++ ;


    // Extract the two numbers (n and m) from the parsed line.
    var    n    =    nm [ 0 ] ;
    var    m    =    nm [ 1 ] ;


    /*
     * Check for the termination condition: if both n and m are zero,
     * the program should exit the loop.
     */
    if    (    n    ==    0    &&    m    ==    0    )
        break    ;


    // Initialize an array to track the infection status of 'n' entities.
    var    infected    =    [ ] ;

    // Initially, assume all entities (except the first one, handled below) are infected.
    for    (    var    i    =    0    ;    i    <    n    ;    i    ++    )
        infected [ i ]    =    true    ;


    // The first entity (index 0) is initially not infected.
    infected [ 0 ]    =    false    ;


    // Initialize an array to store time-sorted data (tsd) packets.
    var    tsd    =    [ ] ;

    /*
     * Loop 'm' times to read 'm' packets of information.
     * Each packet contains time, source, and destination.
     */
    for    (    var    i    =    0    ;    i    <    m    ;    i    ++    )
    {
        // Read the packet line, split by space, and convert to numbers.
        var    packet    =    input [ line ] . split ( " " ) . map ( Number ) ;

        // Increment the line counter.
        line    ++ ;

        /*
         * Push the packet data into the tsd array.
         * Adjust source and destination indices (from 1-based to 0-based).
         */
        tsd . push (    [    packet [ 0 ] ,    packet [ 1 ]    -    1 ,    packet [ 2 ]    -    1    ]    ) ;
    }


    /*
     * Sort the 'tsd' array based on the time component (the first element of each packet).
     * This ensures packets are processed in chronological order.
     */
    tsd . sort (    function    (    a ,    b    )
    {
        return    a [ 0 ]    -    b [ 0 ] ; // Sort by time (a[0])
    }    ) ;


    /*
     * Iterate through each sorted packet to simulate the infection spread.
     * If the source of a packet is not infected, then the destination also becomes not infected.
     */
    tsd . forEach (    function    (    packet    )
    {
        var    s    =    packet [ 1 ] ; // Source entity index
        var    d    =    packet [ 2 ] ; // Destination entity index

        // If the source is immune (not infected), the destination also becomes immune.
        if    (    ! infected [ s ]    )
            infected [ d ]    =    false    ;
    }    ) ;


    // Initialize a counter for the final answer.
    var    answer    =    0 ;

    /*
     * Count the number of entities that are not infected (immune).
     * These are the entities that successfully resisted infection.
     */
    infected . forEach (    function    (    packet    )
    {
        if    (    ! packet    ) // If the entity is not infected (false)
            answer    ++ ;
    }    ) ;


    // Output the final count of non-infected entities to the console.
    console . log (    answer    ) ;

} // End of the main while loop.