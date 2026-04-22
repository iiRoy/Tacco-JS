function ProcessInputData ( rawDataString ) {
  const linesOfData = rawDataString . split ( '\n' ) ;
  const elementCount = parseInt ( linesOfData [ 0 ] ) ;
  const initialNumbers = linesOfData [ 1 ] . split ( ' ' ) . map ( currentVal => parseInt ( currentVal ) ) ;

  let runningAccumulator = 0 ;
  const prefixSumsArray = initialNumbers . map ( ( currentVal ) => {
    runningAccumulator += currentVal ;
    return runningAccumulator ;
  } ) ;

  let firstSegmentValues = [ ] ;
  let secondSegmentValues = [ ] ;
  let thirdSegmentValues = [ ] ;
  let fourthSegmentValues = [ ] ;

  // Process the left-hand side partitions for the four segments
  for ( let iterationIndex = 1 , leftBoundaryIndex = 0 ; iterationIndex < elementCount - 2 ; ++ iterationIndex ) {
    const currentLeftSubarray = prefixSumsArray . slice ( 0 , iterationIndex + 1 ) ;
    const totalLeftSubarraySum = currentLeftSubarray [ currentLeftSubarray . length - 1 ] ;

    let valueLeftA = currentLeftSubarray [ leftBoundaryIndex ] ;
    let valueLeftB = totalLeftSubarraySum - valueLeftA ;
    let valueLeftAPlusOne = currentLeftSubarray [ leftBoundaryIndex + 1 ] ;
    let valueLeftBPlusOne = totalLeftSubarraySum - valueLeftAPlusOne ;

    if ( currentLeftSubarray . length > 2 && Math . abs ( valueLeftBPlusOne - valueLeftAPlusOne ) <= Math . abs ( valueLeftB - valueLeftA ) ) {
      ++ leftBoundaryIndex ;
    }

    firstSegmentValues . push ( currentLeftSubarray [ leftBoundaryIndex ] ) ;
    secondSegmentValues . push ( currentLeftSubarray [ currentLeftSubarray . length - 1 ] - currentLeftSubarray [ leftBoundaryIndex ] ) ;
  }

  // Process the right-hand side partitions for the four segments
  for ( let iterationIndex = elementCount - 2 , rightBoundaryIndex = 1 ; iterationIndex > 1 ; -- iterationIndex , ++ rightBoundaryIndex ) {
    const currentRightSubarray = prefixSumsArray . slice ( iterationIndex ) ;
    const precedingSegmentEndValue = prefixSumsArray . slice ( iterationIndex - 1 , iterationIndex ) [ 0 ] ;
    const totalRightSubarraySum = currentRightSubarray [ currentRightSubarray . length - 1 ] ;

    let valueRightA = totalRightSubarraySum - currentRightSubarray [ rightBoundaryIndex - 1 ] ;
    let valueRightB = currentRightSubarray [ rightBoundaryIndex ] - precedingSegmentEndValue ;
    let valueRightAMinusOne = totalRightSubarraySum - currentRightSubarray [ rightBoundaryIndex - 2 ] ;
    let valueRightBMinusOne = currentRightSubarray [ rightBoundaryIndex - 1 ] - precedingSegmentEndValue ;

    if ( currentRightSubarray . length > 2 && Math . abs ( valueRightAMinusOne - valueRightBMinusOne ) <= Math . abs ( valueRightA - valueRightB ) ) {
      -- rightBoundaryIndex ;
    }

    thirdSegmentValues . unshift ( currentRightSubarray [ rightBoundaryIndex - 1 ] - precedingSegmentEndValue ) ;
    fourthSegmentValues . unshift ( totalRightSubarraySum - currentRightSubarray [ rightBoundaryIndex - 1 ] ) ;
  }

  let overallMinimumDifference = -1 ;
  // Iterate through all calculated segment combinations to find the minimal difference
  for ( let segmentIndex = 0 ; segmentIndex < firstSegmentValues . length ; ++ segmentIndex ) {
    const currentCalculatedDifference = Math . max ( firstSegmentValues [ segmentIndex ] , secondSegmentValues [ segmentIndex ] , thirdSegmentValues [ segmentIndex ] , fourthSegmentValues [ segmentIndex ] ) - Math . min ( firstSegmentValues [ segmentIndex ] , secondSegmentValues [ segmentIndex ] , thirdSegmentValues [ segmentIndex ] , fourthSegmentValues [ segmentIndex ] ) ;
    if ( overallMinimumDifference < 0 || currentCalculatedDifference < overallMinimumDifference ) {
      overallMinimumDifference = currentCalculatedDifference ;
    }
  }

  console . log ( overallMinimumDifference ) ;
}

ProcessInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;