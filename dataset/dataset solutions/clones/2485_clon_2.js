// This routine handles incoming string-based data.
function ProcessInputData ( rawDataString )
{
    // Break down the received string into an array using space as a delimiter.
    let parsedItems = rawDataString . split ( ' ' );

    // Extract the first numeric component from the array.
    let firstValue = Number ( parsedItems [ 0 ] );

    // Extract the second numeric component from the array.
    let secondValue = Number ( parsedItems [ 1 ] );

    // Calculate a preliminary outcome based on the two extracted values.
    let computedResult = firstValue - secondValue * 2 ;

    // If the preliminary outcome is negative, adjust it to zero.
    if  ( computedResult < 0 )
    {
        computedResult = 0 ;
    }


    // Output the final calculated result to the console.
    console . log ( computedResult ) ;
}

// Initiate the data processing by reading from standard input.
ProcessInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;