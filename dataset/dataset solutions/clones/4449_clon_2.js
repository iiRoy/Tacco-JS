const inputDataLines = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( '\n' ) ;

let firstLineTokens = inputDataLines . shift ( ) . split ( ' ' ) ;

const gridHeight = Number ( firstLineTokens . shift ( ) ) ;

const gridWidth = Number ( firstLineTokens . shift ( ) ) ;

const numBlocks = Number ( inputDataLines . shift ( ) ) ;

const outputGrid = [ ] ;

for ( let rowIndex = 0 ; rowIndex < gridHeight ; rowIndex ++ )
{
    outputGrid [ rowIndex ] = new Array ( gridWidth ) ;
}

let currentRow = 0 ;

let currentCol = 0 ;

const blockSizes = inputDataLines . shift ( ) . split ( ' ' ) ;

let directionIndicator = 'R' ;

for ( let blockIndex = 0 ; blockIndex < numBlocks ; blockIndex ++ )
{
    const currentBlockSize = Number ( blockSizes [ blockIndex ] ) ;

    for ( let segmentCount = 0 ; segmentCount < currentBlockSize ; segmentCount ++ )
    {
        if ( outputGrid [ currentRow ] [ currentCol ] === undefined )
        {
            outputGrid [ currentRow ] [ currentCol ] = blockIndex + 1 ;
        }

        if ( currentCol === gridWidth - 1 && directionIndicator === 'R' )
        {
            currentRow ++ ;
            directionIndicator = 'L' ;
        }
        else if ( currentCol === 0 && directionIndicator === 'L' )
        {
            currentRow ++ ;
            directionIndicator = 'R' ;
        }
        else if ( directionIndicator === 'R' )
        {
            currentCol ++ ;
        }
        else if ( directionIndicator === 'L' )
        {
            currentCol -- ;
        }
    }
}

console . log ( outputGrid . map ( rowContent => rowContent . join ( ' ' ) ) . join ( '\n' ) ) ;