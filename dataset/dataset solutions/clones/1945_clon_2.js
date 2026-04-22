// This module processes incoming textual information to extract unique entries.
const ProcessDataStream = incomingContent => {
    // Break down the received content into individual lines.
    const contentLines = incomingContent.split( '\n' );

    // The first line often contains metadata, here it's an initial count.
    // We convert it to an integer and remove it from our working list.
    const initialQuantity = parseInt( contentLines.shift() , 10 );

    // Create a collection to store only the distinct elements.
    // This automatically handles duplicates.
    const uniqueItemsCollection = new Set( contentLines );

    // Output the total number of unique items found.
    global.console.log( uniqueItemsCollection.size );
};

// Initiate the processing using data read from the standard input stream.
// This is typically used in competitive programming environments.
ProcessDataStream( require( 'node:fs' ).readFileSync( '/dev/stdin' , 'utf-8' ) );