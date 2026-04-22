process.stdin.resume ( );
process.stdin.setEncoding ( 'utf8' );

process.stdin.on ( 'data' ,   function   (   inputSegment   )   {
    // Convert the received data chunk to string and split by newline
    var inputLines = inputSegment.toString().split ( '\n' ) ;

    // The first line indicates the total number of items
    var elementCount = inputLines[0];

    // The second line contains the space-separated items
    var dataArray = inputLines[1].split ( ' ' ) ;

    // Display the initial arrangement of items
    console.log( dataArray.join(" ") );

    // Iterate through the array starting from the second item to sort
    for ( var currentIdx = 1 ; currentIdx < elementCount ; currentIdx++ ) {
        // Hold the item to be positioned
        var currentItem = dataArray[currentIdx];

        // Initialize an index for comparison with preceding items
        var compareIdx = currentIdx - 1;

        // Move items greater than the current item one position ahead of their current position
        while ( compareIdx >= 0 && Number ( dataArray[compareIdx] ) > Number ( currentItem ) ) {
            dataArray[compareIdx + 1] = dataArray[compareIdx];
            compareIdx--;
        } // End of internal shifting loop

        // Insert the current item into its proper sorted place
        dataArray[compareIdx + 1] = currentItem;

        // Print the array's state after each item has been inserted
        console.log ( dataArray.join ( " " ) ) ;
    } // End of main sorting loop
} ) ; // End of input data processing function