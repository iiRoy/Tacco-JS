// This routine accepts the entire input payload.
function ProcessInputData (  sourceData  )
{
    // The first line is in sourceData[0], the second in sourceData[1], and so on...
    let lineSegments = sourceData[0] . split ( " " ) ;

    let firstInteger = Number.parseInt ( lineSegments[0] ,   10 ) ;
    const secondInteger = Number.parseInt ( lineSegments[1] ,   10 ) ;
    let finalVerdictValue ;

    finalVerdictValue = 1 ;
    if ( ( firstInteger % secondInteger ) === 0 )
    {
        finalVerdictValue = 0 ;
    }

    console.log ( '%d' ,   finalVerdictValue ) ;
}

// Invoke the primary processing function with data from standard input.
ProcessInputData (
    require ( "fs" )
        . readFileSync ( "/dev/stdin" , "utf8" )
) ;