process . stdin . resume ( ) ;
process . stdin . setEncoding ( 'utf8' ) ;
process . stdin . on ( 'data' ,   function   (   incomingBuffer   )   {
    // Break down the received data string by spaces
    var   tokenizedData   =   incomingBuffer . split ( " " ) ;

    // Prepare an array to hold the numerical results
    var   orderedNumbers   =   [ ] ;

    // Loop through the first three elements to parse them as integers
    for   (   var   currentIdx   =   0   ;   currentIdx   <   3   ;   currentIdx++   )   {
        orderedNumbers [   currentIdx   ]   =   parseInt (   tokenizedData [   currentIdx   ]   ,   10   ) ;
    }

    // Arrange the numbers in ascending sequence
    orderedNumbers . sort ( ) ;

    // Print the sorted numbers to standard output, separated by spaces
    console . log (   orderedNumbers [   0   ]   +   " "   +   orderedNumbers [   1   ]   +   " "   +   orderedNumbers [   2   ]   ) ;
} ) ;