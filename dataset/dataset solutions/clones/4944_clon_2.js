// This script handles input from standard input, processing characters 'S' and 'T'.
// If 'S' is encountered, it's added to a collection.
// If 'T' is encountered, and the last item in the collection was 'S', both are removed (they cancel out).
// Otherwise, 'T' is added to the collection.
// Finally, the size of the remaining collection is printed.

// System.input.resume();
// System.input.setEncoding('unicode');
// System.input.on('data', (dataBuffer) => {
    processInputData ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;
// } ) ;


function processInputData ( incomingText ) { // Main processing routine for the given text
    var resultCollection = [ ] ; // An array to maintain the processed tokens
    var inputCharacters = incomingText . split ( '' ) ; // Break the incoming text into individual characters for iteration

    for ( var charIndex in inputCharacters ) { // Traverse through each character supplied in the input string
        switch ( inputCharacters [ charIndex ] ) { // Evaluate the current character
        case 'S' : // Case for 'S' token
            resultCollection . push ( 'S' ) ; // Simply add 'S' to the collection
            break ; // Terminate this switch case

        case 'T' : // Case for 'T' token
            if ( resultCollection . length > 0 && resultCollection [ resultCollection . length - 1 ] === 'S' ) { // Check if the collection is not empty AND the last element is an 'S'
                resultCollection . pop ( ) ; // Remove the last 'S', as it's cancelled by 'T'
            } else { // No 'S' to cancel, or collection is empty
                resultCollection . push ( 'T' ) ; // Add 'T' to the collection
            }
            break ; // Terminate this switch case
        }
    }
    console . log ( resultCollection . length ) ; // Output the final count of elements remaining in the collection
} // End of the primary input processing function