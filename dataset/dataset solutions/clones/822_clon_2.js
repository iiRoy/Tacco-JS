function PerformDataProcessing(incomingData)
{
    let lineSegments = incomingData.split("\n") ;

    for
    (
        let currentLineIndex = 0 ;
        true ;
        currentLineIndex++
    )
    {
        const primaryNumber = parseInt(lineSegments[currentLineIndex], 10) ;
        let outcomeTally = 0 ;

        if ( primaryNumber === 0 )
        {
            break ;
        }

        for ( let secondaryCounter = 2 ; secondaryCounter < primaryNumber ; secondaryCounter++ )
        {
            if
            (
                (primaryNumber - secondaryCounter * (secondaryCounter - 1) / 2) >= 0
                &&
                (primaryNumber - secondaryCounter * (secondaryCounter - 1) / 2) % secondaryCounter === 0
            )
            {
                outcomeTally++ ;
            }
        }

        console.log(outcomeTally) ;
    }
}

PerformDataProcessing ( require("fs").readFileSync("/dev/stdin" , "utf8") ) ;