'use strict';
console.info(  (function( inputContent ) {
  const rawInputLines = inputContent.trim().split( '\n' );
  const boardDimensions = rawInputLines[0].split( ' ' ).map( valStr => parseInt( valStr, 10 ) );
  const numRows = boardDimensions[0], numCols = boardDimensions[1];
  const gridLayout = [ Array( numCols + 2 ).fill( Number.POSITIVE_INFINITY ) ];
  let traversableCells = 0;
  for ( let currentRow = 1; currentRow <= numRows; ++currentRow ) {
    gridLayout.push( [ Number.POSITIVE_INFINITY ] );
    for ( let currentCol = 0; currentCol < numCols; ++currentCol ) {
      if ( rawInputLines[currentRow][currentCol] === '.' ) {
        traversableCells++; gridLayout[currentRow].push( 0 );
      } else { gridLayout[currentRow].push( Number.POSITIVE_INFINITY ); }
    }
    gridLayout[currentRow].push( Number.POSITIVE_INFINITY );
  }
  gridLayout.push( Array( numCols + 2 ).fill( Number.POSITIVE_INFINITY ) );
  const movementVectors = [ [ -1, 0 ], [ 0, -1 ], [ 1, 0 ], [ 0, 1 ] ];
  const searchQueue = [ [ 1, 1, 2 ] ];
  do {
    const currentPathSegment = searchQueue.shift();
    for ( const moveDelta of movementVectors ) {
      const nextXCoord = currentPathSegment[0] + moveDelta[0], nextYCoord = currentPathSegment[1] + moveDelta[1];
      if ( nextXCoord === numCols && nextYCoord === numRows ) return traversableCells - currentPathSegment[2];
      if ( gridLayout[nextYCoord][nextXCoord] === 0 ) {
        gridLayout[nextYCoord][nextXCoord] = currentPathSegment[2] + 1;
        searchQueue.push( [ nextXCoord, nextYCoord, currentPathSegment[2] + 1 ] );
      }
    }
  } while ( searchQueue.length > 0 );
  })( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) ) );