// This script processes input from stdin to solve a problem related to disease spread.
// It uses Node.js standard input/output streams.

process.stdin.resume( );  // Ensures the standard input stream remains open and the process doesn't exit.

process.stdin.setEncoding( "utf8" ) ; // Configures the input stream to decode incoming data as UTF-8 text.


// Attaches an event listener to the standard input stream.
// This function will be executed whenever new data chunks are available.
process.stdin.on("data",   function  ( chunk )   {

    // The received data 'chunk' is first trimmed of any leading/trailing whitespace,
    // and then split into an array of strings, where each string represents a line of input.
    var input = chunk.trim( ).split( "\n" ) ;

    // Initializes a variable to keep track of the current line being processed from the 'input' array.
    var   line  =   0 ;


    // This is the main processing loop. It continues indefinitely until explicitly broken.
    while ( true )
    {
        // Reads the current line from the input, splits it by one or more whitespace characters,
        // and then maps each resulting string segment to a Number.
        // This typically extracts 'n' and 'm' values for a test case.
        var nm = input[ line ].split( /\s+/ ).map( Number ) ;

        // Increments the line counter to point to the next line for subsequent reads.
        line++;

        // Extracts the first element as 'n' (number of people) and the second as 'm' (number of spread events).
        var n = nm[ 0 ] ;
        var m = nm[ 1 ] ;


        // This is the termination condition for the main loop.
        // If both 'n' and 'm' are zero, it signifies the end of input test cases.
        if  ( n  ==  0  &&  m  ==  0 )
        {
            break ; // Exits the 'while (true)' loop.
        }


        // Declares and initializes an array to keep track of the infection status of individuals.
        // Initially, all individuals are considered infected.
        var infected = [ ] ;
        for  ( var i  =  0 ;  i  <  n ;  i++ )
            infected[ i ] = true ;

        // Crucially, the first individual (index 0) is marked as NOT infected.
        // This is often referred to as patient zero, who is immune or the source of cure.
        infected[ 0 ] = false ;


        // Declares and initializes an array to store the disease spread events.
        var tsd = [ ] ;
        for  ( var i  =  0 ;  i  <  m ;  i++ )
        {
            // Reads a line representing a spread event, parses it into numbers.
            var packet = input[ line ].split( /\s+/ ).map( Number ) ;

            line++ ; // Advances the input line pointer.

            // Stores the event data: [timestamp, sender_index, receiver_index].
            // Note: Sender and receiver indices are adjusted from 1-based to 0-based.
            tsd.push( [ packet[ 0 ] ,  packet[ 1 ] - 1 ,  packet[ 2 ] - 1 ] ) ;
        }


        // Sorts the 'tsd' array based on the timestamp of each event (the first element of each inner array).
        // This ensures that spread events are processed in chronological order.
        tsd.sort( function ( a ,  b ) {
            return  a[ 0 ]  -  b[ 0 ] // Comparison based on the timestamp (packet[0])
        } ) ;


        // Iterates through each sorted spread event to update the infection statuses.
        tsd.forEach( function ( packet ) {
            var a = packet[ 1 ] ; // Gets the sender's index from the current event.
            var b = packet[ 2 ] ; // Gets the receiver's index from the current event.

            // If the sender ('a') was NOT infected at the time of this event,
            // then the receiver ('b') also becomes NOT infected.
            if  ( !infected[ a ] )
            {
                infected[ b ] = false ;
            }
        } ) ;


        // Initializes a counter for the final answer.
        // The answer is the total number of individuals who are NOT infected.
        var answer = 0 ;
        infected.forEach( function ( packet ) {
            // Checks if the current individual's status is 'false' (meaning they are not infected).
            if  ( !packet )
            {
                answer++; // Increments the counter if the individual is uninfected.
            }
        } ) ;


        // Prints the calculated answer for the current test case to the console.
        console.log( answer ) ;

    } // End of the main 'while (true)' loop for processing test cases.

} ) ; // End of the 'data' event listener function.