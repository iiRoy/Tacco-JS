function ProcessData( rawData )
{
  let   linesArray = rawData.split( "\n" );

  let resourceLimit = parseInt( linesArray[0].split( " " )[0] );
  let typeCount = parseInt( linesArray[0].split( " " )[1] );

  let workUnits = linesArray[1].split( " " ) . map( ( elementString , currentIndex ) =>
  {
    return [ currentIndex , parseInt( elementString ) ];
  } );

  let lastProcessedIndex = -1;
  let totalOperations = 0;

  while( true )
  {
    if ( resourceLimit === 0 )
    {
      return console.log( totalOperations );
    };

    workUnits.sort( function( itemOne , itemTwo ) { return itemOne[1] < itemTwo[1]; } );

    let wasFound = 0;
    for ( let iterationIndex = 0 ; iterationIndex < workUnits.length ; iterationIndex++ )
    {
      if ( workUnits[iterationIndex][1] > 0 && workUnits[iterationIndex][0] !== lastProcessedIndex )
      {
        lastProcessedIndex = workUnits[iterationIndex][0];
        workUnits[iterationIndex][1]--;
        resourceLimit--;
        wasFound = 1;
        break;
      }
    };

    if ( !wasFound )
    {
      for ( let iterationIndex = 0 ; iterationIndex < workUnits.length ; iterationIndex++ )
      {
        if ( workUnits[iterationIndex][1] > 0 )
        {
          lastProcessedIndex = workUnits[iterationIndex][0];
          workUnits[iterationIndex][1]--;
          resourceLimit--;
          totalOperations++;
          break;
        }
      };
    }
  }
}
ProcessData( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) );