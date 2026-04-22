function  evaluateRange( currentLimit )   {
  var   isFeasible =  true ;
  var   partCounter = 0 ;
  var   accumulatedValue = 0 ;

  for(  var entryIdx = 0 ; entryIdx < inputElements.length ; entryIdx++  )
  {
    if  ( currentLimit < inputElements[entryIdx] )
    {
      isFeasible = false ;
      break ;
    }
    else if ( accumulatedValue + inputElements[entryIdx] === currentLimit )
    {
      accumulatedValue = 0 ;
      if ( entryIdx !== inputElements.length - 1 ) partCounter++ ;
    }
    else if ( accumulatedValue + inputElements[entryIdx] > currentLimit )
    {
      accumulatedValue = inputElements[entryIdx] ;
      partCounter++ ;
    }
    else if ( accumulatedValue + inputElements[entryIdx] < currentLimit )
    {
      accumulatedValue += inputElements[entryIdx] ;
    }

    if ( partCounter === maxAllowedParts )
    {
      isFeasible = false ;
      break ;
    }
  }
  return isFeasible ;
}

const fileSystemModule = require ( 'fs' ) ;
var sourceContent = fileSystemModule . readFileSync ( '/dev/stdin' ,  'utf8' ) ;
var processedLines = sourceContent . trim ( ) . split ( "\n" ) ;

while ( true )
{
  var configurationString = processedLines . shift ( ) ;
  if ( configurationString === "0 0" ) break ;

  configurationString = configurationString . split ( " " ) . map ( Number ) ;

  var maxAllowedParts = configurationString [ 0 ] ;
  var numberOfEntries = configurationString [ 1 ] ;

  var inputElements = [ ] ;
  while ( numberOfEntries -- )
  {
    inputElements . push ( parseInt ( processedLines . shift ( ) , 10 ) ) ;
  }

  var lowerBound = 0 ;
  var upperBound = 1500000 ;

  while ( true )
  {
    var midPoint = Math . floor ( ( lowerBound + upperBound ) / 2 ) ;
    var checkOutcome = evaluateRange ( midPoint ) ;

    if ( checkOutcome )
    {
      upperBound = midPoint - 1 ;
    }
    else
    {
      lowerBound = midPoint + 1 ;
    }

    if ( lowerBound > upperBound ) break ;
  }
  console . log ( upperBound + 1 ) ;
}