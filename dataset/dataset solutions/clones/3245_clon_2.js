var INPUT_UTILITIES = ( function () {
  function createInputReader ( rawInputText ) {
    return new DataProcessor( rawInputText );
  }

  function DataProcessor ( sourceContentString ) {
    this._sourceLineSegments = sourceContentString.trim().split( "\n" );
    this._currentSegmentIndex = 0;
  }

  DataProcessor.prototype.extractNextValue = function ( getStringValue ) {
    var lineParts = this._sourceLineSegments,
        segmentPointer = this._currentSegmentIndex,
        pulledValue;

    if ( typeof lineParts[segmentPointer] === "string" ) {
      lineParts[segmentPointer] = lineParts[segmentPointer].split( " " ).reverse();
    }
    pulledValue = lineParts[segmentPointer].pop();
    if ( !lineParts[segmentPointer].length ) {
      this._currentSegmentIndex++;
    }
    return getStringValue ? pulledValue : +pulledValue;
  };

  DataProcessor.prototype.readNextLineValues = function ( returnAsStrings ) {
    var lineData = this._sourceLineSegments[this._currentSegmentIndex++].split( " " );
    return returnAsStrings ? lineData : lineData.map( segment => +segment );
  };

  DataProcessor.prototype.readBlockOfLines = function ( rowsCount, keepRawStrings ) {
    var matrixContent = this._sourceLineSegments.slice( this._currentSegmentIndex, this._currentSegmentIndex += rowsCount ).map( inputRow => inputRow.split( " " ) );
    return keepRawStrings ? matrixContent : matrixContent.map( inputRow => inputRow.map( cellText => +cellText ) );
  };

  DataProcessor.prototype.readNumericLines = function ( numberOfLines, returnUntouched ) {
    var lineCollection = this._sourceLineSegments.slice( this._currentSegmentIndex, this._currentSegmentIndex += numberOfLines );
    return returnUntouched ? lineCollection : lineCollection.map( singleLine => +singleLine );
  };

  return createInputReader;
} )();

var inputHandler = INPUT_UTILITIES( require( "node:fs" ).readFileSync( 0, "utf-8" ) );

var displayResult = function( outputMessage ) { console.log( outputMessage ); };
displayResult( executeGraphProcess() );

function executeGraphProcess () {
  var nodeTotal = inputHandler.extractNextValue();
  var edgeTotal = inputHandler.extractNextValue();
  var inboundLinks = [];
  var outboundLinks = [];
  var depthAssignments = Array( nodeTotal + edgeTotal - 1 ).fill( 1e10 );

  for ( var idxCounter = 0; idxCounter < nodeTotal + edgeTotal - 1; idxCounter++ ) {
    var currentEdge = inputHandler.readNextLineValues().map( valEntry => valEntry - 1 );
    if ( inboundLinks[currentEdge[1]] ) {
      inboundLinks[currentEdge[1]].push( currentEdge[0] );
    } else {
      inboundLinks[currentEdge[1]] = [ currentEdge[0] ];
    }
    if ( outboundLinks[currentEdge[0]] ) {
      outboundLinks[currentEdge[0]].push( currentEdge[1] );
    } else {
      outboundLinks[currentEdge[0]] = [ currentEdge[1] ];
    }
  }

  var finalOutputValues = [];
  for ( idxCounter = 0; ; idxCounter++ ) {
    if ( !inboundLinks[idxCounter] ) {
      var currentQueue = outboundLinks[idxCounter];
      finalOutputValues[idxCounter] = 0;
      depthAssignments[idxCounter] = 0;
      break;
    }
  }

  var nodesProcessedCount = 1,
      currentDepthLevel = 1;

  while ( nodesProcessedCount < nodeTotal ) {
    var nextQueueItems = [];
    for ( idxCounter = 0; idxCounter < currentQueue.length; idxCounter++ ) {
      var activeNode = currentQueue[idxCounter],
          isAssignable = 1;
      for ( var neighborIndex = 0; neighborIndex < inboundLinks[activeNode].length; neighborIndex++ ) {
        if ( depthAssignments[inboundLinks[activeNode][neighborIndex]] >= currentDepthLevel ) {
          isAssignable = 0;
          break;
        }
        if ( depthAssignments[inboundLinks[activeNode][neighborIndex]] === currentDepthLevel - 1 ) {
          finalOutputValues[activeNode] = inboundLinks[activeNode][neighborIndex] + 1;
        }
      }
      if ( isAssignable ) {
        depthAssignments[activeNode] = currentDepthLevel;
        nodesProcessedCount++;
        if ( outboundLinks[activeNode] ) {
          nextQueueItems = nextQueueItems.concat( outboundLinks[activeNode] );
        }
      }
    }
    currentQueue = nextQueueItems;
    currentDepthLevel++;
  }
  return finalOutputValues.join( "\n" );
}