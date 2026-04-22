// This processing function receives all input information as a single string.
function ProcessData (incomingText)
{
    // The received text is divided into an array of individual lines.
    // The first line is at textLines[0], the second at textLines[1], and so on.
    let textLines = incomingText.split ("\n") ;

    const initialValues = textLines[0].split (' ') ;
    let itemQuantity = Number(initialValues[0]) ;
    let threshold = Number (initialValues[1]) ;

    let valueStrings = textLines[1].split(' ') ;
    let halfMultiplied = [ ] ; // Prepare an empty array to store the results.

    // Loop through the string values to apply a specific transformation.
    for (let loopIndex = 0; loopIndex < itemQuantity; loopIndex ++ )
    {
        halfMultiplied.push( Number(valueStrings[loopIndex]) * 0.5 ) ;
    }

    let productAccumulator = halfMultiplied.reduce( (currentProduct, nextValue) => currentProduct * nextValue ) ;
    let stepsTaken = 0 ;

    // Repeatedly double the accumulator until its value surpasses the defined threshold.
    while (threshold > productAccumulator)
    {
        productAccumulator += productAccumulator ; // Perform the doubling operation
        stepsTaken ++ ; // Increment the counter for each doubling step performed
    }

    console.log(stepsTaken) ;
}

// Please do not alter the following section (it manages reading from standard input and invoking the primary processing function).
ProcessData( require("fs").readFileSync("/dev/stdin", "utf8") ) ;