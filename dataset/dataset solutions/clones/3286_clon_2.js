function ProcessInput ( rawData )
{
    rawData = rawData . split ( "\n" ) ;

    let dimensionsData = rawData[0] . split ( " " ) ;
    let boardHeight = Number ( dimensionsData[0] ) ;
    let boardWidth = Number ( dimensionsData[1] ) ;

    let gameGrid = [ ] ;
    let recordedConnections = [ ] ;

    for
        (
            let currentY = 0 ;
            currentY < boardHeight ;
            currentY++
        )
    {
        let rowContent = rawData[currentY + 1] . split ( "" ) ;
        gameGrid . push ( rowContent ) ;
    }

    for ( let currentY = 0 ; currentY < boardHeight ; currentY++ )
    {
        let checkFlag = false ;
        for ( let currentX = 0 ; currentX < boardWidth ; currentX++ )
        {
            const blockedCell = "#" ;
            const openCell = "." ;

            if ( gameGrid[currentY][currentX] !== blockedCell )
            {
                continue ;
            }

            if
            (
                ( currentY - 1 !== -1 )
                &&
                ( gameGrid[currentY - 1][currentX] === openCell )
            )
            {
                recordedConnections . push ( [ [ currentY, currentX ], [ currentY - 1, currentX ] ] ) ;
            }

            if
            (
                ( currentX - 1 !== -1 )
                &&
                ( gameGrid[currentY][currentX - 1] === openCell )
            )
            {
                recordedConnections . push ( [ [ currentY, currentX ], [ currentY, currentX - 1 ] ] ) ;
            }

            if
            (
                ( currentY + 1 < boardHeight )
                &&
                ( gameGrid[currentY + 1][currentX] === openCell )
            )
            {
                recordedConnections . push ( [ [ currentY, currentX ], [ currentY + 1, currentX ] ] ) ;
            }

            if
            (
                ( currentX + 1 < boardWidth )
                &&
                ( gameGrid[currentY][currentX + 1] === openCell )
            )
            {
                recordedConnections . push ( [ [ currentY, currentX ], [ currentY, currentX + 1 ] ] ) ;
            }
        }
    }
    console . log ( recordedConnections . length ) ;
}


ProcessInput
(
    require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )
) ;