function processInputData ( initialInputString ) {
  const inputLines = initialInputString . trim ( ) . split ( '\n' ) ;
  const itemCount = Number ( inputLines . shift ( ) ) ;
  const itemValues = inputLines . shift ( ) . split ( ' ' ) . map ( Number ) ;
  let inversionTally = [ 0 ] ;

  recursivelySortAndCount ( itemValues , 0 , itemCount , inversionTally ) ;

  console.log ( inversionTally [ 0 ] ) ;
}

function recursivelySortAndCount ( targetArray , lowerBound , upperBound , tallyReference ) {
  if ( lowerBound + 1 < upperBound ) {
    const splitPoint = Math . ceil ( ( lowerBound + upperBound ) / 2 ) ;
    recursivelySortAndCount ( targetArray , lowerBound , splitPoint , tallyReference ) ;
    recursivelySortAndCount ( targetArray , splitPoint , upperBound , tallyReference ) ;
    combineAndCount ( targetArray , lowerBound , splitPoint , upperBound , tallyReference ) ;
  }
}

function combineAndCount ( mainArray , startPos , splitPos , endPos , countTracker ) {
  const leftSegment = mainArray . slice ( startPos , splitPos ) ;
  const rightSegment = mainArray . slice ( splitPos , endPos ) ;

  leftSegment . push ( Infinity ) ;
  rightSegment . push ( Infinity ) ;
  let leftPtr = 0 ;
  let rightPtr = 0 ;

  for ( let currentIdx = startPos , iterationLimit = endPos ; currentIdx < iterationLimit ; currentIdx++ ) {
    if ( leftSegment [ leftPtr ] <= rightSegment [ rightPtr ] ) {
      mainArray [ currentIdx ] = leftSegment [ leftPtr ] ;
      leftPtr++ ;
    } else {
      mainArray [ currentIdx ] = rightSegment [ rightPtr ] ;
      rightPtr++ ;

      countTracker [ 0 ] += splitPos - startPos - leftPtr ;
    }
  }
}


processInputData ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;