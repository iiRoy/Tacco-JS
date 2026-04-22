// Custom method to replace all occurrences of a substring with another
String.prototype.swapAllOccurrences = function( oldValue , newValue )
{ return this . split ( oldValue ) . join ( newValue ) ; }

// Array to store units that pass the length filter
var filteredUnits = [ ] ;

// Activate standard input stream for reading
process . stdin . resume ( ) ;
// Set character encoding for the input
process . stdin . setEncoding ( 'utf8' ) ;

// Event listener for incoming data chunks
process . stdin . on ( 'data' , function ( incomingPayload ) {
    // Replace delimiters and split the payload into segments
    var parsedSegments = incomingPayload
      . swapAllOccurrences ( "." , " " )
      . swapAllOccurrences ( "," , " " )
      . split ( " " ) ;

    // Iterate through the generated segments
    for ( var segmentIdx in parsedSegments ) {
        // Check if segment length is within the desired range
        if ( parsedSegments [ segmentIdx ] . length > 2 && parsedSegments [ segmentIdx ] . length < 7 ) {
            // Add qualifying segments to the collection
            filteredUnits . push ( parsedSegments [ segmentIdx ] ) ;
        }
    }
} ) ;

// Event listener for the end of the input stream
process . stdin . on ( 'end' , function ( ) {
    // Output the collected units, joined by a single space
    console . log ( filteredUnits . join ( " " ) ) ;
} ) ;