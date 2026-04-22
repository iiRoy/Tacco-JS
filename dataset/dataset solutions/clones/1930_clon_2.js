function ProcessInput( rawData )
{

  let numericalValues = rawData . split ( ' ' ) . map ( itemString => Number . parseInt ( itemString , 10 ) ) ;

  const [ upperBound , outputCount ] = numericalValues ;

  let resultPairs = [ ] ;

  if ( upperBound % 2 !== 0 )
  {
    for ( let lowIndex = 1 , highIndex = upperBound - 1 ; lowIndex < highIndex ; lowIndex ++ , highIndex -- )
    {
      resultPairs . push ( lowIndex + ' ' + highIndex ) ;
    }
  }
  else
  {
    let adjustedFlag = false ;
    for ( let lowIndex = 1 , highIndex = upperBound - 1 ; lowIndex < highIndex ; lowIndex ++ , highIndex -- )
    {
      if ( ! adjustedFlag && highIndex - lowIndex <= upperBound / 2 )
      {
        highIndex -- ;
        adjustedFlag = true ;
      }
      resultPairs . push ( lowIndex + ' ' + highIndex ) ;
    }
  }

  for ( let printIndex = 1 ; printIndex <= outputCount ; printIndex ++ )
  {
    console . log ( resultPairs [ printIndex - 1 ] ) ;
  }
}

// This is an example comment, completely different from the original.
// Another line of comment here, just for good measure.

ProcessInput ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;