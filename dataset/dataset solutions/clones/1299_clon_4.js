const obtainStreamData = () => {
  return new Promise( ( resolveCurrent, rejectCurrent ) => {
    let receivedContent = '';
    const dataStream = process.stdin;
    dataStream.resume();
    dataStream.setEncoding( 'utf-8' );

    dataStream.on( 'data', ( piece ) => {
      receivedContent += piece;
    });

    dataStream.on( 'end', () => {
      resolveCurrent( receivedContent );
    });

    dataStream.on( 'error', ( issue ) => {
      rejectCurrent( issue );
    });
  });
};

const processMatrix = async () => {
  try {
    const fullContent = await obtainStreamData();
    const contentLines = fullContent.trim().split( '\n' );

    const dimensionParts = contentLines[0].split( ' ' ).map( Number );
    const rowDimension = dimensionParts[0];
    const columnDimension = dimensionParts[1];

    const initialMatrix = contentLines.slice( 1 ).map( ( lineText ) => {
      return lineText.split( ' ' ).map( Number );
    });

    // --- Step 1: Calculate row sums and append to each row ---
    const matrixWithRowSums = initialMatrix.map( ( currentLine ) => {
      const lineTotal = currentLine.reduce( ( accumulator, value ) => accumulator + value, 0 );
      return [...currentLine, lineTotal];
    });

    // --- Step 2: Calculate column sums and overall total via matrix transposition ---

    const performTransposition = ( originalGrid ) => {
      if ( originalGrid.length === 0 || originalGrid[0].length === 0 ) {
        return [];
      }
      const totalRows = originalGrid.length;
      const totalColumns = originalGrid[0].length;
      const transformedGrid = Array.from( { length: totalColumns }, () => Array( totalRows ).fill( 0 ) );
      for ( let rPosition = 0; rPosition < totalRows; rPosition++ ) {
        for ( let cPosition = 0; cPosition < totalColumns; cPosition++ ) {
          transformedGrid[cPosition][rPosition] = originalGrid[rPosition][cPosition];
        }
      }
      return transformedGrid;
    };

    const transposedInitialMatrix = performTransposition( initialMatrix );

    const columnTotals = transposedInitialMatrix.map( ( currentColumn ) => {
      return currentColumn.reduce( ( accumulator, value ) => accumulator + value, 0 );
    });

    // Calculate the grand total from the column totals
    const comprehensiveTotal = columnTotals.reduce( ( accumulator, value ) => accumulator + value, 0 );

    // Append the comprehensive total to the column totals
    const finalColumnResults = [...columnTotals, comprehensiveTotal];

    // --- Step 3: Format output ---
    const formattedRows = matrixWithRowSums.map( ( rowArray ) => rowArray.join( ' ' ) );
    const formattedFinalRow = finalColumnResults.join( ' ' );

    const finalDisplay = [...formattedRows, formattedFinalRow].join( '\n' );
    console.log( finalDisplay );

  } catch ( issue ) {
    console.error( 'An operational error occurred:', issue );
  }
};

processMatrix();