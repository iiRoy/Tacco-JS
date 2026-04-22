/*
 * This JavaScript file processes numerical data to calculate
 * standard deviation for multiple sets of input numbers.
 *
 * It reads input from stdin, parses it, and then
 * calls the main processing function.
 */

// Define the primary function that handles data processing
function main( lines ) {
    // Loop indefinitely until a termination condition is met
    for ( var i = 0 ; ; ) {
        // Read the number of items for the current set
        // The 'i++' increments the index for the next line
        var noItems = parseInt( lines[ i++ ], 10 ) ;

        // Check if noItems is zero, which signifies the end of input
        if ( noItems === 0 ) {
            // Exit the loop if no more items are to be processed
            break ;
        }

        // Parse the line containing the actual numbers
        // Split by one or more whitespace characters and convert to floats
        var items = lines[ i++ ].split( /\s+/ ).map( parseFloat ) ;

        // Calculate the average (mean) of the items
        // Reduce function sums all elements, then divide by count
        var average = items.reduce( function( sum , n ) { return sum + n ; } , 0 ) / items.length ;

        // Calculate the variance
        // Sum of squared differences from the mean, divided by the count
        var variance = items.reduce( function( sum , n ) { return sum + Math.pow( n - average , 2 ) ; } , 0 ) / items.length ;

        // The standard deviation is the square root of the variance
        var standarddeviation = Math.sqrt( variance ) ;

        // Output the calculated standard deviation, formatted to 6 decimal places
        console.log( standarddeviation.toFixed( 6 ) ) ;
    } // End of the processing loop
} // End of the main function definition


// Array to store incoming data chunks from standard input
var chunks = [ ] ;

// Set up an event listener for 'data' events on standard input
process.stdin.on( 'data' , function( chunk ) {
    // Append each received data chunk to the 'chunks' array
    chunks.push( chunk ) ;
} ) ;

// Set up an event listener for the 'end' event on standard input
process.stdin.on( 'end' , function( ) {
    // Once all data has been received, join chunks and split into lines
    var lines = chunks.join( '' ).split( '\n' ) ;

    // Call the main processing function with the collected lines
    main( lines ) ;
} ) ;

// End of script