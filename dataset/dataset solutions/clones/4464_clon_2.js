// This module processes input data to find a specific path.
// Author: AI Assistant
// Date: 2023-10-27
function processInputData( rawInputContent ) {

  let linesOfData = rawInputContent.split( "\n" );

  let firstElementList = [ ];
  let secondElementList = [ ];
  let parsedPair = [ ];

  let globalMaximumValue = 0;

  for ( let currentLineIndex = 0; currentLineIndex < linesOfData.length; currentLineIndex++ ) {

    parsedPair = linesOfData[ currentLineIndex ].split( " " );

    firstElementList[ currentLineIndex ] = Number( parsedPair[ 0 ] );
    if ( firstElementList[ currentLineIndex ] > globalMaximumValue ) {
      globalMaximumValue = firstElementList[ currentLineIndex ];
    }

    secondElementList[ currentLineIndex ] = Number( parsedPair[ 1 ] );
    if ( secondElementList[ currentLineIndex ] > globalMaximumValue ) {
      globalMaximumValue = secondElementList[ currentLineIndex ];
    }
  }


  let searchStartIndex = -1;

  while ( true ) {

    searchStartIndex = firstElementList.indexOf( 1, searchStartIndex + 1 );

    if ( searchStartIndex < 0 ) {
      console.log( "IMPOSSIBLE" );
      return;
    }
    else {
      // Debug: Outputting current search index.
      let searchNextPosition = -1;

      while ( true ) {
        searchNextPosition = firstElementList.indexOf( secondElementList[ searchStartIndex ], searchNextPosition + 1 );
        // Debug: Checking next search position.
        if ( searchNextPosition < 0 ) {
          break;
        }
        else {
          if ( secondElementList[ searchNextPosition ] === globalMaximumValue ) {
            console.log( "POSSIBLE" );
            return;
          }
        }
      }
    }
  }

}

processInputData( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );