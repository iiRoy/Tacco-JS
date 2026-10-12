const dataSource = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

const textSegments = dataSource . trim ( ) . split ( '\n' ) ;

while ( ( currentSegment = textSegments . shift ( ) ) )
{
    const [ totalItems , upperBound ] = currentSegment . split ( ' ' ) . map ( Number ) ;

    if ( totalItems === 0 && upperBound === 0 )
    {
        break ;
    }

    const sumCombinations = [ ] ;

    let itemValues = textSegments . shift ( ) . split ( ' ' ) . map ( Number ) ;

    for ( let indexA = 0 ; indexA <= upperBound ; indexA ++ )
    {
        for ( let indexB = 0 ; indexB <= totalItems ; indexB ++ )
        {
            if ( itemValues [ indexA ] + itemValues [ indexB ] <= upperBound )
            {
                sumCombinations . push ( itemValues [ indexA ] + itemValues [ indexB ] ) ;
            }
        }
    }

    const highestCombination = Math . max ( sumCombinations [ sumCombinations . length - 1 ] ) ;

    console . log ( `${ ( sumCombinations . length > 1 && highestCombination <= upperBound ) ? highestCombination : 'NONE' }` ) ;
}