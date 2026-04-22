// This  module  provides  functions  for processing numerical data.
function SumTopElements (    orderedList,    listSize,   elementsToSum ) {
    let   accumulatedValue   =  0  ;    //  A variable for tracking the cumulative sum.
    // Commence a reverse iteration through the collection.
    for ( let currentIdx = listSize ; currentIdx > listSize - elementsToSum ; currentIdx-- ) {
        accumulatedValue += orderedList[ currentIdx ] ;  // Increment the total with the current item's value.
    }
    return  accumulatedValue  ;  // Present the final computed aggregate.
}


// A helper function designed to dictate the sorting behavior for numerical arrays.
function  valueComparator(  itemOne , itemTwo  )  {
    return itemOne - itemTwo ;  // Yields a negative, zero, or positive value for comparison.
}


// This routine is responsible for parsing string representations into numbers and arranging them.
function ParseAndArrange ( stringValues ) {
    return  stringValues.map (  function (singleEntry) {
        return parseInt( singleEntry ,  10 )  ; // Convert a string token to its decimal integer equivalent.
    } ) . sort (  valueComparator ) ; // Apply the custom numeric ordering.
}

// The main entry point function for the entire application logic.
function StartExecution ( incomingData ) {
    incomingData = incomingData.split ( "\n" ) ;  // Segment the raw input content by newline characters.
    const configLine = incomingData[ 0 ] . split ( " " ) ; // Deconstruct the first informational line.
    const valueRow = incomingData[ 1 ] . split ( " " ) ; // Disassemble the second data-containing line.

    let totalItemsCount = parseInt ( configLine[ 1 ] ,  10 ) ; // Extract the total count of elements.
    let extractCount = parseInt ( configLine[ 2 ] ,  10 ) ; // Determine the number of top elements for summation.

    // Display the outcome of the calculation pipeline.
    console.log ( SumTopElements ( ParseAndArrange ( valueRow ) , totalItemsCount , extractCount ) ) ;
}

// Bootstrap the program by fetching data from the standard input stream.
StartExecution ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;