( function ( rawData ) {
  /*
  This script processes geometric coordinates to find the circumcenter
  and circumradius of triangles defined by three points.
  */
  var processedLines = rawData
    .replace( /\n$/, '' )
    .split( '\n' );
  var numCases = Number( processedLines.shift() );

  for ( var caseIndex = 0; caseIndex < numCases; caseIndex++ ) {
    var currentCoords = processedLines[ caseIndex ]
      .split( ' ' )
      .map( Number );

    // Original debug statement has been removed
    // console.log(currentCoords);

    var coordA_x = currentCoords.shift();
    var coordA_y = currentCoords.shift();
    var coordB_x = currentCoords.shift();
    var coordB_y = currentCoords.shift();
    var coordC_x = currentCoords.shift();
    var coordC_y = currentCoords.shift();

    var center_x = (
        (
          Math.pow( coordC_x, 2 ) - Math.pow( coordB_x, 2 ) +
          Math.pow( coordC_y, 2 ) - Math.pow( coordB_y, 2 )
        ) * ( coordB_y - coordA_y ) -
        (
          Math.pow( coordB_x, 2 ) - Math.pow( coordA_x, 2 ) +
          Math.pow( coordB_y, 2 ) - Math.pow( coordA_y, 2 )
        ) * ( coordC_y - coordB_y )
      ) / 2 /
      (
        ( coordB_y - coordA_y ) * ( coordC_x - coordB_x ) -
        ( coordB_x - coordA_x ) * ( coordC_y - coordB_y )
      );

    var center_y = (
        (
          Math.pow( coordC_y, 2 ) - Math.pow( coordB_y, 2 ) +
          Math.pow( coordC_x, 2 ) - Math.pow( coordB_x, 2 )
        ) * ( coordB_x - coordA_x ) -
        (
          Math.pow( coordB_y, 2 ) - Math.pow( coordA_y, 2 ) +
          Math.pow( coordB_x, 2 ) - Math.pow( coordA_x, 2 )
        ) * ( coordC_x - coordB_x )
      ) / 2 /
      (
        ( coordB_x - coordA_x ) * ( coordC_y - coordB_y ) -
        ( coordB_y - coordA_y ) * ( coordC_x - coordB_x )
      );

    console.log(
      center_x.toFixed( 3 ),
      center_y.toFixed( 3 ),
      Math.sqrt(
        Math.pow( coordA_x - center_x, 2 ) +
        Math.pow( coordA_y - center_y, 2 )
      ).toFixed( 3 )
    );
  }
} )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );