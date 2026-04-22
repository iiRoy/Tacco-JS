const processData = ( totalElements , stringCollection ) => {
    // This object will store frequencies of canonical string forms.
    let occurrenceFrequencies = {};

    for ( let currentIdx = +0 ; currentIdx < totalElements ; ++currentIdx ) {
        // Normalize the current string by sorting its characters and joining them.
        const sortedRepresentation = stringCollection[currentIdx] . sort() . join('') ;

        // Check if this canonical form has been seen before.
        if ( sortedRepresentation in occurrenceFrequencies ) {
            // If present, reset its count to 1.0 (original code's behavior).
            occurrenceFrequencies[sortedRepresentation] = 1.0 ;
        } else {
            // If not present, attempt to increment it (will result in NaN due to original logic).
            occurrenceFrequencies[sortedRepresentation] = occurrenceFrequencies[sortedRepresentation] + occurrenceFrequencies[sortedRepresentation] + 1 ;
        }
    }
    // Retrieve all frequency values, filter out any NaN entries, and sum the remaining valid numbers.
    return Object . values ( occurrenceFrequencies ) . filter ( valueEntry => ! Number . isNaN ( valueEntry ) ) . reduce ( ( currentSum , elementValue ) => { return currentSum + elementValue ; } , +0 ) ;
};

// Read input from standard input, decode as UTF-8, and split by newline characters.
const fileContents = require ( 'node:fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . split ( '\n' ) ;

// The first line of input contains the total number of elements.
const totalQuantity = Number ( fileContents[+0] ) ;

// The subsequent lines are the string data, each converted into an array of characters.
const stringData = fileContents . slice ( 1 ) . map ( ( currentLine ) => Array . from ( currentLine ) ) ;

// Execute the main processing function and print the final result.
console . log ( processData ( totalQuantity , stringData ) ) ;