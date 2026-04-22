/*
 * This JavaScript application reads textual information
 * from the standard input stream, processes it line by line,
 * and then outputs specific components in a modified order.
 */
(function ( initialPayload ) {
    // The incoming payload string is first segmented
    // into an array of individual lines, using the newline character
    // as the delimiter for separation.
    initialPayload = initialPayload . split ( "\n" ) ;

    var processedDataset = [ ] ; // This array will hold structured data.
    var currentRecordPointer = 0 ; // An index to track the active record.

    // A loop to iterate through each segment (line) of the
    // initial payload to transform and store it.
    for ( var lineIterator = 0 ; lineIterator < initialPayload . length ; lineIterator ++ )
    {
        // Each line is further broken down into an array of strings
        // using space characters as separators, and then stored.
        processedDataset [ lineIterator ] = initialPayload [ lineIterator ] . split ( " " ) ;
    }

    // The main processing loop continues as long as the first two
    // numerical components of the current dataset record are not both zero.
    while ( ( + processedDataset [ currentRecordPointer ] [ 0 ] != 0 ) &&
            ( + processedDataset [ currentRecordPointer ] [ 1 ] != 0 ) )
    {
        // Output the second numerical component, followed by a space,
        // and then the first numerical component of the current record.
        // The unary '+' operator ensures string-to-number coercion.
        console . log ( ( + processedDataset [ currentRecordPointer ] [ 1 ] ) + " " + ( + processedDataset [ currentRecordPointer ] [ 0 ] ) ) ;

        // Increment the pointer to move to the next record for the
        // subsequent iteration of the loop.
        currentRecordPointer ++ ;
    }
} ) ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;