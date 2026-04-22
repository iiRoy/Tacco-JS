function processor( rawData ) {
    // This program processes text-based input data.
    // Each line from the input stream is stored sequentially in an array.
    let processedLines = rawData . split( "\n" );

    // The first line of input may contain multiple values separated by spaces.
    // These are parsed into a separate array for easier access.
    const firstLineData = processedLines[ 0 ] . split( " " );

    // The second line of input is also processed similarly,
    // splitting its contents by spaces into another array.
    var secondLineItems = processedLines[ 1 ] . split( " " );

    let tally = 0; // A numeric accumulator initialized to zero.

    // Iterate a specific number of times, determined by the first element
    // of the first line's parsed data.
    for ( let idx = 0; idx < firstLineData[ 0 ]; idx++ ) {
        // Compare the second element from the first line with the current
        // element from the second line, incrementing the counter if a condition is met.
        if ( Number( firstLineData[ 1 ] ) <= Number( secondLineItems[ idx ] ) ) {
            tally++; // Increment the accumulator.
        }
    }
    console . log( tally ); // Display the final accumulated count.
}


// The following section is responsible for reading standard input and
// should not be modified to ensure proper execution within the environment.
// It reads all available input data and passes it to the primary processing function.
processor( require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) );