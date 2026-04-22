var DATA_PARSER_FACTORY = (
  function( ) {
    // This function acts as a factory for creating input stream processors.
    function createInputProcessor ( sourceContent ) {
      return new StreamProcessor( sourceContent );
    }

    // The core class for parsing input data line by line.
    function StreamProcessor ( sourceContent ) {
      this._contentLines = sourceContent.trim( ).split( "\n" );
      this._linePointer  = 0; // Tracks the current line being processed.
    }

    // Method to extract a single value (token) from the current line.
    StreamProcessor.prototype.extractValue = function( returnAsText ) {
      var lineSegments = this._contentLines, // Reference to all lines
          currentLineIdx = this._linePointer, // Current line index
          extractedSegment;                   // The token to be returned

      // If the current line hasn't been split into tokens yet, do so and reverse it
      // so 'pop' can retrieve tokens from the beginning of the original line.
      if ( typeof lineSegments[ currentLineIdx ] === "string" ) {
        lineSegments[ currentLineIdx ] = lineSegments[ currentLineIdx ].split( " " ).reverse( );
      }

      // Pop the last element (which is the first token from the original line).
      extractedSegment = lineSegments[ currentLineIdx ].pop( );

      // If the current line is now empty, advance the line pointer.
      if ( !lineSegments[ currentLineIdx ].length ) {
        this._linePointer++;
      }

      // Return as string or convert to number based on the flag.
      return returnAsText ? extractedSegment : +extractedSegment;
    };

    // Method to retrieve an entire line, split into tokens.
    StreamProcessor.prototype.retrieveLine = function( keepStrings ) {
      // Get the current line, split by spaces, and then advance the pointer.
      var lineParts = this._contentLines[ this._linePointer++ ].split( " " );

      // Return as array of strings or array of numbers.
      return keepStrings ? lineParts : lineParts.map( item => +item );
    };

    // Method to fetch a block of lines as a matrix.
    StreamProcessor.prototype.fetchMatrix = function( numberOfRows, asStringMatrix ) {
      // Slice the required number of rows, then split each row into tokens.
      var matrixData = this._contentLines
                         .slice( this._linePointer, this._linePointer += numberOfRows )
                         .map( matrixRow => matrixRow.split( " " ) );

      // Return as string matrix or convert all elements to numbers.
      return asStringMatrix
             ? matrixData
             : matrixData.map( matrixRow => matrixRow.map( item => +item ) );
    };

    // Method to get a specified number of raw lines.
    StreamProcessor.prototype.getLines = function( linesToRead, asStringArray ) {
      // Slice the required number of lines.
      var readLines = this._contentLines.slice( this._linePointer, this._linePointer += linesToRead );

      // Return as string array or convert all elements to numbers.
      return asStringArray ? readLines : readLines.map( item => +item );
    };

    return createInputProcessor; // The module exports the factory function.
  }
)();

// Initialize the data stream processor by reading from standard input.
var dataStream = DATA_PARSER_FACTORY( require("fs").readFileSync("/dev/stdin", "utf8") );

// Execute the main computation function and log its result.
console.log( computeMaximumPath( ) );

/**
 * Main function to calculate the maximum path length through a grid
 * considering certain forbidden zones.
 * @returns {number} The maximum reachable path length.
 */
function computeMaximumPath( ) {
  // Read grid dimensions and number of obstacles from the input stream.
  var totalMapHeight = dataStream.extractValue( );
  var totalMapWidth  = dataStream.extractValue( );
  var obstacleCount  = dataStream.extractValue( );

  // Initialize a 2D structure (array of objects) to mark forbidden zones.
  // The first row (index 0) is unused, so it's `totalMapHeight + 1`.
  var forbiddenZones = Array( totalMapHeight + 1 )
                         .fill( 0 )
                         .map( placeholder => { return {}; } );

  // Process each obstacle.
  for ( var rowIndex = 0; rowIndex < obstacleCount; rowIndex++ ) {
    var zoneCoordinates = dataStream.retrieveLine( ); // Read obstacle coordinates (row, column).
    // If the x-coordinate is less than the y-coordinate, it's an invalid obstacle placement, skip it.
    if ( zoneCoordinates[ 0 ] < zoneCoordinates[ 1 ] ) continue;
    // Mark the cell (y, x) as forbidden.
    forbiddenZones[ zoneCoordinates[ 1 ] ][ zoneCoordinates[ 0 ] ] = 1;
  }

  // Mark the column immediately to the right of the map width as forbidden for all rows.
  // This acts as a boundary.
  for ( rowIndex = 1; rowIndex <= totalMapHeight; rowIndex++ ) {
    forbiddenZones[ rowIndex ][ totalMapWidth + 1 ] = 1;
  }

  // Initialize the maximum path length based on the first row's first forbidden zone.
  // Object.keys returns strings, so we convert to number and subtract 1.
  var maximumPathLength = Object.keys( forbiddenZones[ 1 ] )[ 0 ] - 1;
  var currentPathX      = 2; // Start path finding from column 2.

  // Iterate through rows starting from the second row, up to the current maximum path length
  // and the total map height.
  for ( rowIndex = 2; rowIndex <= maximumPathLength && rowIndex <= totalMapHeight; rowIndex++ ) {
    // Skip columns in the current row until a non-forbidden cell is found.
    while ( forbiddenZones[ rowIndex ][ currentPathX ] ) {
      currentPathX++;
    }

    // Iterate through the forbidden zones (columns) in the current row.
    for ( var zoneColumn in forbiddenZones[ rowIndex ] ) {
      zoneColumn = +zoneColumn; // Ensure zoneColumn is a number.

      // If the current path X position has already passed or is at this forbidden column, skip it.
      if ( currentPathX >= zoneColumn ) continue;

      // If this forbidden column is closer than the current maximum path length, update it.
      if ( zoneColumn - 1 < maximumPathLength ) {
        maximumPathLength = zoneColumn - 1;
      }
      break; // Once the first relevant forbidden zone is found, move to the next row.
    }

    currentPathX++; // Advance the path X position for the next row.
    // If the path X position exceeds the total map width, no further path is possible.
    if ( currentPathX > totalMapWidth ) break;
  }

  return maximumPathLength; // Return the calculated maximum path length.
}