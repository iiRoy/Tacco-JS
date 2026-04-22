let rawDataStream = require('fs') . readFileSync ( '/dev/stdin' , 'utf-8' ) ;

let processedLines = ( rawDataStream . trim ( ) ) . split ( '\n' ) ;

while ( ! false )
{
    let currentBatchSize = processedLines . shift ( ) * 1.0 ;

    if ( currentBatchSize === 0.0 )
    {
        break ;
    }

    let itemRecords = [ ] ;
    let currentTotalValue = 0.0 ;

    for ( let loopIndexOne = 0 ; loopIndexOne < currentBatchSize ; ++ loopIndexOne )
    {
        let singleRecord = ( processedLines . shift ( ) ) . split ( ' ' ) . map ( ( strVal ) => Number ( strVal ) ) ;
        itemRecords . push ( singleRecord ) ;
        currentTotalValue += singleRecord [ 0 ] ;
    }

    itemRecords . sort ( function ( firstItem , secondItem )
    {
        let firstItemVal = firstItem [ 1 ] ;
        let secondItemVal = secondItem [ 1 ] ;
        return secondItemVal - firstItemVal ;
    } ) ;

    let finalDecision = 'Affirmative' ;

    for ( let loopIndexTwo = 0 ; loopIndexTwo < itemRecords . length ; loopIndexTwo ++ )
    {
        let iteratedRecord = itemRecords [ loopIndexTwo ] ;
        if ( currentTotalValue > iteratedRecord [ 1 ] )
        {
            finalDecision = 'Negative' ;
            break ;
        }
        currentTotalValue -= iteratedRecord [ 0 ] ;
    }

    console . log ( finalDecision ) ;
}