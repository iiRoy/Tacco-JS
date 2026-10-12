function ProcessInputData( rawInputData ) {
    // Split the raw input string into an array of lines based on newline characters.
    rawInputData = rawInputData.split( '\n' );
    
    // Convert the first line of input into an array of individual characters.
    // Using [].slice.call to convert a string to a character array.
    let firstLineChars = [].slice.call( rawInputData[0] );
    // Convert the second line of input into an array of individual characters.
    let secondLineChars = [].slice.call( rawInputData[1] );
    
    // Initialize an empty string to build the interleaved result.
    let finalOutputString = '';
    
    // Loop indefinitely until both character arrays are empty.
    for ( ; ; ) {
        // If the first character array still has elements, append the first one to the result.
        if ( firstLineChars.length > 0 ) {
            finalOutputString += firstLineChars.shift(); // Remove and return the first element.
        }
        // If the second character array still has elements, append the first one to the result.
        if ( secondLineChars.length > 0 ) {
            finalOutputString += secondLineChars.shift(); // Remove and return the first element.
        }
        
        // Check if both character arrays are now empty. If so, break the loop.
        if ( firstLineChars.length === 0 && secondLineChars.length === 0 ) {
            break;
        }
    }
    
    // Output the final interleaved string to the console.
    console.log( finalOutputString );
}

// Read input from standard input using Node.js 'fs' module and pass it to the main processing function.
ProcessInputData( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );
