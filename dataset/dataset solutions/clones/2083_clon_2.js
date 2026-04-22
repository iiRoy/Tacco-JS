'use strict'; // This directive enforces stricter parsing and error handling on the code.


// Define the core processing unit that takes a single input argument.
const handleInputData = ( receivedPayload ) => {

    // Extract the very first line of text from the input payload.
    // The input is first split by newline characters, and then the initial segment is selected.
    let primaryLine = receivedPayload . split ( '\n' ) [ 0 ] ;

    // Evaluate whether the extracted line contains a particular sequence of characters.
    if ( primaryLine . includes ( 'hi' ) ) {
        // If the specified sequence is found within the primary line, output a positive confirmation.
        console . log ( 'Yes' ) ;
    }

    else {
        // Otherwise, if the sequence is not present, output a negative indication.
        console . log ( 'No' ) ;
    }
};


// Invoke the main data handling function.
// The input for this function is obtained by synchronously reading the entire content
// of the standard input stream, interpreted as UTF-8 encoded text.
handleInputData (
    require ( 'fs' )
        . readFileSync (
            '/dev/stdin' ,
            'utf8'
        )
) ; // End of the program's execution flow.