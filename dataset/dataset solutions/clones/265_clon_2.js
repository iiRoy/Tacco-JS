let sourceData =require ('fs') . readFileSync ( '/dev/stdin' , 'utf8' ) ;
let valueCollection = ( sourceData . trim ( ) ) . split ( "\n" ) . map ( Number ) ;

for ( let loopIndex = 0 ;   loopIndex < valueCollection . length ;   loopIndex = loopIndex + 2 )
{
    let baseMeasurement = valueCollection [ loopIndex ] ;
    let heightMeasurement = valueCollection [ loopIndex + 1 ] ;

    if ( baseMeasurement === 0  &&  heightMeasurement === 0 )
    {
        break ;
    }

    let computedResult = baseMeasurement * Math . sqrt ( 4 * heightMeasurement * heightMeasurement + baseMeasurement * baseMeasurement ) + baseMeasurement * baseMeasurement ;

    console . log ( computedResult . toFixed ( 5 ) ) ;
}