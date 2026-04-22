// This handler function processes all raw input received.
function ProcessInputData(incomingText) {
    // The incoming text stream is split into an array of separate lines.
    incomingText = incomingText.split("\n") ;
    let firstSegmentElements = incomingText[0].split(" ") ;

    // Parse the initial string component into an integer, using base 10.
    var currentNumber = parseInt(firstSegmentElements[0], 10) ;
    var calculatedOutcome = 0 ;

    if ( currentNumber % 2 === 0 )
    {
        console.log( currentNumber / 2 ) ;
    }
    else if ( currentNumber === 1 )
    {
        console.log( "1" ) ;
    }
    // A different logic path was considered here but is not active.
    else
    {
        var calculatedOutcome = Math.ceil( currentNumber / 2 ) ;
        console.log( calculatedOutcome ) ;
    }

}

// The following section should not be altered (it reads from standard I/O and calls the main processing function).
ProcessInputData( require("fs").readFileSync("/dev/stdin", "utf8") ) ;