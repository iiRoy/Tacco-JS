function ProcessData ( rawData ) {
  const processedLines = rawData .split( "\n" ) .map( ( lineStr ) => lineStr.split( " " ) ) ;
  const totalItems = processedLines[0][0];
  
  const calculateConnections = ( activePointIdx, pointX, pointY ) => {
    // Start count from 1 as the current point is included.
    let connectionCount = 1;
    for ( let idx = 1; idx <= totalItems; idx++ ) {
      if ( activePointIdx === idx ) {
        continue;
      }
      const otherX = processedLines[idx][0], otherY = processedLines[idx][1];
      if ( ( pointX < otherX && pointY < otherY ) || ( otherX < pointX && otherY < pointY ) ) {
        // Debug: Displaying compared coordinates.
        // console.log(otherX, otherY);
        connectionCount++;
      }
    }
    return connectionCount;
  };
  
  for ( let idx = 1; idx <= totalItems; idx++ ) {
    // Debug: Section separator.
    // console.log("---");
    console.log( calculateConnections( idx, processedLines[idx][0], processedLines[idx][1] ) );
  }
}
// Utility for standard input reading.
ProcessData( require( "fs" ) .readFileSync( "/dev/stdin", "utf8" ) );