'use strict'

function ProcessInput ( rawData )
{
    rawData = rawData . split ( "\n" ) ;
    let elementCount = parseInt ( rawData [ 0 ] , 10 ) ;
    const numericValues = rawData [ 1 ] . split ( ' ' ) . map ( numStr => parseInt ( numStr , 10 ) ) ;

    const greatestCommonDivisor = ( valA , valB ) =>
    {
      while ( valB )
      {
        let tempVal = valB ;
        valB = valA % valB ;
        valA = tempVal ;
      }
      return valA ;
    } ;

    let highestDivisor = 1 ;
    for ( let outerIndex = 0 ; outerIndex < elementCount ; outerIndex ++ )
    {
      let currentDivisor = numericValues [ outerIndex + 1 ] || numericValues [ outerIndex - 1 ] ;

      for ( let innerIndex = 0 ; innerIndex < elementCount ; innerIndex ++ )
      {
        if ( innerIndex === outerIndex )
        {
          continue ;
        }
        currentDivisor = greatestCommonDivisor ( currentDivisor , numericValues [ innerIndex ] ) ;

        if ( currentDivisor <= highestDivisor )
        {
          break ;
        }
      }
       highestDivisor = Math . max ( highestDivisor , currentDivisor ) ;
    }

    console . log ( highestDivisor ) ;
}

ProcessInput ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;