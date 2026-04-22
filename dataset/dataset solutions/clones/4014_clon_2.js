// This function processes all incoming raw text data.
function ProcessInput ( rawData ) {

    var textLines = rawData.split ( '\n' );
    var parts = textLines [ 0 ] .split ( ' ' );

    var gridHeight = Number ( parts [ 0 ] );
    var gridWidth = Number ( parts [ 1 ] );
    var moveInterval = Number ( parts [ 2 ] );

    var coordinateMap = [ ]; // Stores cell value to its grid coordinates.

    for ( var rowIdx = 1; rowIdx < gridHeight + 1; rowIdx++ ) {
        var currentCells = textLines [ rowIdx ] .split ( ' ' );

        for ( var colIdx = 0; colIdx < currentCells.length; colIdx++ ) {
            var cellValue = Number ( currentCells [ colIdx ] );
            coordinateMap [ cellValue ] = { "coordX" : rowIdx, "coordY" : colIdx + 1 };
        }
    }

    var queryCount = Number ( textLines [ gridHeight + 1 ] );
    var startPoints = [ ]; // Array for beginning values of queries.
    var endPoints = [ ];   // Array for ending values of queries.

    for ( var queryIter = 1; queryIter < queryCount + 1; queryIter++ ) {
        var queryParts = textLines [ gridHeight + 1 + queryIter ] .split ( ' ' );
        startPoints.push ( Number ( queryParts [ 0 ] ) );
        endPoints.push ( Number ( queryParts [ 1 ] ) );
    }

    var results = [ ]; // Stores the calculated distances for each query.

    for ( var queryIdx = 0; queryIdx < startPoints.length; queryIdx++ ) {
        results [ queryIdx ] = 0;
        var iterations = ( endPoints [ queryIdx ] - startPoints [ queryIdx ] ) / moveInterval;
        for ( var pathSegmentIdx = 0; pathSegmentIdx < iterations; pathSegmentIdx++ ) {
            var currentPosition = coordinateMap [ startPoints [ queryIdx ] + pathSegmentIdx * moveInterval ];
            var nextPosition = coordinateMap [ startPoints [ queryIdx ] + ( pathSegmentIdx + 1 ) * moveInterval ];
            results [ queryIdx ] += Math.abs ( nextPosition.coordX - currentPosition.coordX ) + Math.abs ( nextPosition.coordY - currentPosition.coordY );
        }
    }

    console.log ( results.join ( '\n' ) );
}

// Do not modify the lines below (reads input from standard I/O and invokes the primary function).
ProcessInput ( require ( 'fs' ) .readFileSync ( '/dev/stdin', 'utf8' ) );