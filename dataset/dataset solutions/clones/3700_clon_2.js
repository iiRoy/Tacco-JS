let inputBuffer = [ ] ;
let maxDifference = 0 ;

let ioHandler = readline . createInterface ( {
    input: process . stdin ,
    output: process . stdout ,
} ) ;

ioHandler . on ( 'line' , function ( currentLineText )
{
    inputBuffer . push ( currentLineText ) ;
} ) ;

ioHandler . on ( 'close' , function ( )
{
    let elementCount = Number ( inputBuffer [ 0 ] ) ;

    let numberArray = inputBuffer [ 1 ] . split ( " " ) . map ( singleValueString => Number ( singleValueString ) ) ;

    for ( let outerIndex = 0 ; outerIndex < elementCount ; outerIndex ++ )
    {
        for ( let innerIndex = 0 ; innerIndex < elementCount ; innerIndex ++ )
        {
            maxDifference = Math . max ( maxDifference , Math . abs ( numberArray [ outerIndex ] - numberArray [ innerIndex ] ) ) ;
        }
    }
    console . log ( maxDifference ) ;
} ) ;