function ProcessInputData ( rawData )
{
  const linesArray = rawData . split ( '\n' ) ;

  const pairsOfStrings = linesArray . map ( ( lineStr ) => lineStr . split ( ' ' ) ) ;

  const uniquePairs = linesArray . map ( ( currentLine ) => new Set ( currentLine . split ( ' ' ) ) ) ;

  // This variable holds the initial count of distinct collections.
  let distinctCount = pairsOfStrings . length ;

  for ( let outerIndex = 1 ; outerIndex < pairsOfStrings . length ; outerIndex++ ) { // Start processing from the second entry.
    for ( let innerIndex = 0 ; innerIndex < outerIndex ; innerIndex++ ) { // Compare against all preceding entries.
      if ( uniquePairs [ innerIndex ] . has ( pairsOfStrings [ outerIndex ] [ 0 ] ) || uniquePairs [ innerIndex ] [ 0 ] . has ( pairsOfStrings [ outerIndex ] [ 1 ] ) )
      {
        distinctCount -- ;
        break ;
      }
    }
  }
  console . log ( distinctCount ) ;
}

ProcessInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;