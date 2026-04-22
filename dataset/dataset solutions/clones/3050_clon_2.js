function ProcessData(rawDataInput) {
    // This function processes an array of numerical values to determine
    // how many elements are visible from the left.
    // An element is considered visible if its value is greater than or
    // equal to the maximum value encountered so far.

    let linesArray = rawDataInput.split('\n') ;

    // Parse the second line of the input as an array of integers.
    // Each integer represents a height measurement.
    const heightsArray = linesArray[1] . split(' ') . map( currentHeightVal => parseInt(currentHeightVal, 10) ) ;

    let visibleCount = 0 ; // Counter for the number of visible elements.
    let currentMaxHeight = 0 ; // Stores the maximum height observed up to the current point.

    // Iterate over each height measurement in the array.
    heightsArray . forEach( currentHeightVal => {
        // If the current height is greater than or equal to the maximum height
        // seen so far, it means this element is visible from the left.
        if ( currentHeightVal >= currentMaxHeight ) {
            visibleCount ++ ; // Increment the count of visible elements.
            currentMaxHeight = currentHeightVal ; // Update the maximum height.
        }
    } ) ;

    // Output the final tally of visible elements.
    console . log(visibleCount) ;
}

// The program starts by reading data from standard input,
// then passes it to the main processing function.
ProcessData( require("node:fs") . readFileSync("/dev/stdin", "utf8") ) ;