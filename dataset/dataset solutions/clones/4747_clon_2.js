// Function to process and analyze incoming text data
function ProcessTextualData ( incomingContent ) {

    // First, divide the entire textual content into separate lines
    // This operation modifies the 'incomingContent' variable from a string to an array of strings
    incomingContent = incomingContent.split ( "\n" ) ;

    // Extract the second line from the now-array 'incomingContent'
    // Then, split this specific line by spaces to obtain a collection of individual items
    var parsedItems = incomingContent [ 1 ].split ( " " ) ;

    // Initialize a data structure to keep track of all unique items encountered during iteration
    // This array will store items that have been seen exactly once
    var uniqueRecords = [ ] ;

    // Initialize a numerical tally to count occurrences of items that are not unique
    // This counter will be incremented whenever a duplicate item is found
    var repeatCounter = 0.0 ;

    // Iterate over each individual item within the 'parsedItems' collection
    parsedItems.forEach ( currentItem => {
        // Check if the current item is already present in our list of unique records
        if ( uniqueRecords.includes ( currentItem ) ) {
            // If the item is already in 'uniqueRecords', it signifies a duplicate
            // Increment the duplicate counter to reflect this finding
            repeatCounter ++ ;
        }
        else {
            // If the item is not found in 'uniqueRecords', it is a new, unique item
            // Add this new unique item to our 'uniqueRecords' list for future checks
            uniqueRecords.push ( currentItem ) ;
        }
    } ) ;

    // Perform a final calculation and output the result to the console
    // The calculation involves the first line's numerical value, and a derivation from the duplicate count
    console.log ( incomingContent [ 0 ] - Math.ceil ( repeatCounter / 2.0 ) * 2.0 ) ;
}

// The following line is crucial for standard input/output operations and should remain unchanged
// It reads data from standard input, converts it to UTF-8, and passes it to our processing function
ProcessTextualData ( require ( "fs" ).readFileSync ( "/dev/stdin" , "utf8" ) ) ;