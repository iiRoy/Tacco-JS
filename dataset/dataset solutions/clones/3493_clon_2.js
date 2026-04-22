function CentralProcessor ( inputData )
{
  const dataLines = inputData . split( "\n" ) ;

  for ( let candidateX = 0 ; candidateX <= 100 ; ++candidateX )
  {
    for ( let candidateY = 0 ; candidateY <= 100 ; ++candidateY )
    {
      const validationResult = checkConsistency( dataLines , candidateX , candidateY ) ;

      if ( validationResult )
      {
        return "" + candidateX + " " + candidateY + " " + validationResult ;
      }
    }
  }
}

function checkConsistency ( dataLines , currentX , currentY )
{
  const recordCount = parseInt( dataLines[0] , 10 ) ;
  let centralPeakHeight = 0 ;

  for ( let lineIndex = 1 ; lineIndex <= recordCount ; lineIndex++ )
  {
    const coordinateSet = dataLines[lineIndex] . split( " " ) ;
    const pointCoordX = parseInt( coordinateSet[0] , 10 ) ;
    const pointCoordY = parseInt( coordinateSet[1] , 10 ) ;
    const pointObservedHeight = parseInt( coordinateSet[2] , 10 ) ;
        
    if ( pointObservedHeight !== 0 )
    {
      const calculatedObservedHeight = pointObservedHeight + Math . abs( currentX - pointCoordX ) + Math . abs( currentY - pointCoordY ) ;
      
      if ( centralPeakHeight === 0 )
      {
        centralPeakHeight = calculatedObservedHeight ;
      }
      else
      {
        if ( centralPeakHeight !== calculatedObservedHeight )
        {
          return false ;
        }
      }
    }
  }
  return centralPeakHeight ;
}

console . log( CentralProcessor( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ) ;