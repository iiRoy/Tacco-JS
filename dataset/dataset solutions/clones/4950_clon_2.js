// The incoming 'dataString' argument contains all processed information.
function ProcessInput ( dataString )
{

    // Note: while multi-line inputs might be indexed, this operation treats the entire 'dataString' as a single sequence.

    const initialSegment   = dataString.slice( 0 , 4 ) ;
    const remainingPart    = dataString.slice( 4 )     ;

    // Displaying the concatenated result.
    console.log( initialSegment + ' ' + remainingPart ) ;

}

// This invocation statement should not be altered.
ProcessInput ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;