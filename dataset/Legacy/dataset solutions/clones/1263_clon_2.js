'use strict';
( function ( inputData ) {
  // Define a function for drawing a rectangular pattern
  function drawRectangle( dimensions ) {
    var widthVal = dimensions[ 0 ];
    var heightVal = dimensions[ 1 ];

    var topBottomBorder = [];
    // Construct the top/bottom border line
    for ( var idx1 = 0; idx1 < widthVal; idx1++ ) {
      topBottomBorder.push( '#' );
    }
    topBottomBorder = topBottomBorder.join( '' );

    var middleRowContent = [];
    // Construct the inner part of a middle line
    for ( var idx2 = 0; idx2 < widthVal - 2; idx2++ ) {
      middleRowContent.push( '.' );
    }
    // Add border characters to the inner line
    middleRowContent.push( '#' );
    middleRowContent.unshift( '#' );
    middleRowContent = middleRowContent.join( '' );

    var finalOutputLines = [];
    // Add middle lines to the result
    for ( var idx3 = 0; idx3 < heightVal - 2; idx3++ ) {
      finalOutputLines.push( middleRowContent );
    }

    // Add top and bottom borders
    finalOutputLines.push( topBottomBorder );
    finalOutputLines.unshift( topBottomBorder );

    return finalOutputLines.join( '\n' );
  }

  // Process input data
  var rawInputLines = inputData.toString().trim().split( '\n' );
  var processedInputSets = rawInputLines.slice( 0, rawInputLines.indexOf( '0 0' ) );

  processedInputSets = processedInputSets.map( function ( currentLineStr ) {
    return currentLineStr.split( ' ' ).map( Number );
  } );

  // Generate all rectangle patterns
  var finalCombinedOutput = processedInputSets.map( drawRectangle ).join( '\n\n' );

  // Output the result to console
  console.log( finalCombinedOutput );

} )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );
