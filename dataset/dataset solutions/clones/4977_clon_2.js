function ProcessGridUpdates ( inputData )
{
  inputLines = inputData . split ( "\n" ) ;

  const numRows = parseInt ( inputLines[0].split(" ")[0] , 10 ) ;
  const numCols = parseInt ( inputLines[0].split(" ")[1] , 10 ) ;

  let neighborTally = new Array ( 10 ) ;
  neighborTally . fill ( 0 ) ;

  neighborTally[0] = ( numRows - 2 ) * ( numCols - 2 ) ;

  if ( inputLines . length === 1 )
  {
    console.log ( neighborTally . join ( "\n" ) ) ;
    return ;
  }

  let cellStates = new Array ( numRows ) ;
  for ( let rowIdx = 0 ; rowIdx < numRows ; rowIdx ++ )
  {
    cellStates[rowIdx] = new Array ( numCols ) ;
    cellStates[rowIdx] . fill ( false ) ;
  }

  let currentPointCoords ;
  let adjacentMarkedCells ;

  for ( let lineIndex = 1 ; lineIndex < inputLines . length ; lineIndex ++ )
  {
    currentPointCoords = inputLines[lineIndex] . split ( " " ) ;

    [ 0 , 1 ] . forEach ( coordComponentIdx => {
      currentPointCoords[coordComponentIdx] = parseInt ( currentPointCoords[coordComponentIdx] , 10 ) - 1 ;
    } ) ;

    cellStates[currentPointCoords[0]][currentPointCoords[1]] = true ;

    [ -1 , 0 , 1 ] . forEach ( rowOffsetA => {
      [ -1 , 0 , 1 ] . forEach ( colOffsetB => {

        if ( ( 1 <= rowOffsetA + currentPointCoords[0] ) &&
             ( rowOffsetA + currentPointCoords[0] < numRows - 1 ) &&
             ( 1 <= colOffsetB + currentPointCoords[1] ) &&
             ( colOffsetB + currentPointCoords[1] < numCols - 1 ) )
        {
          adjacentMarkedCells = 0 ;

          [ -1 , 0 , 1 ] . forEach ( subRowOffsetC => {
            [ -1 , 0 , 1 ] . forEach ( subColOffsetD => {
              adjacentMarkedCells += cellStates[currentPointCoords[0] + rowOffsetA + subRowOffsetC][currentPointCoords[1] + colOffsetB + subColOffsetD] ? 1 : 0 ;
            } ) ;
          } ) ;

          neighborTally[adjacentMarkedCells - 1] -- ;
          neighborTally[adjacentMarkedCells] ++ ;
        }

      } ) ;
    } ) ;
  }
  console.log ( neighborTally . join ( "\n" ) ) ;
}


ProcessGridUpdates ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;