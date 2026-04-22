const DATA_PARSER = ( ( ) => {
  function createInputHandler ( inputString ) {
    return new InputStreamProcessor( inputString ) ;
  }

  function InputStreamProcessor ( rawData ) {
    this.linesOfData = rawData.trim().split( '\n' ) ;
    this.currentLinePointer = 0 ;
  }

  InputStreamProcessor.prototype.extractNextValue = function ( returnAsString ) {
    let allLines = this.linesOfData ,
        lineIndex = this.currentLinePointer ,
        extractedValue ;

    if ( typeof allLines[lineIndex] === 'string' ) {
      allLines[lineIndex] = allLines[lineIndex].split( ' ' ).reverse() ;
    }

    extractedValue = allLines[lineIndex].pop() ;

    if ( ! allLines[lineIndex].length ) {
      this.currentLinePointer++ ;
    }

    return returnAsString ? extractedValue : +extractedValue ;
  } ;

  InputStreamProcessor.prototype.readEntireLine = function ( getTextualValues ) {
    let lineSegments = this.linesOfData[this.currentLinePointer++].split( ' ' ) ;
    return getTextualValues ? lineSegments : lineSegments.map( item => +item ) ;
  } ;

  InputStreamProcessor.prototype.getMatrix = function ( numRows, outputAsStrings ) {
    let collectedRows = this.linesOfData.slice( this.currentLinePointer, this.currentLinePointer += numRows ).map( rowStr => rowStr.split( ' ' ) ) ;
    return outputAsStrings ? collectedRows : collectedRows.map( rowArray => rowArray.map( cellItem => +cellItem ) ) ;
  } ;

  InputStreamProcessor.prototype.getVector = function ( elementsCount, asStrings ) {
    let extractedElements = this.linesOfData.slice( this.currentLinePointer, this.currentLinePointer += elementsCount ) ;
    return asStrings ? extractedElements : extractedElements.map( element => +element ) ;
  } ;

  return createInputHandler ;
} ) ( ) ;

const dataHandler = DATA_PARSER( require( 'node:fs' ).readFileSync( '/dev/stdin', 'utf8' ) ) ;

process.stdout.write( findMinimumRounds() + '\n' ) ;

function findMinimumRounds ( ) {
  let totalNodes = dataHandler.extractNextValue() ;
  let totalEdges = dataHandler.extractNextValue() ;
  let edgeConnections = dataHandler.getMatrix( totalEdges ) ;

  let isInitialNode = new Array( totalNodes + 1 ).fill( true ) ;
  let parentToChildMap = new Array( totalNodes + 1 ).fill( null ).map( ( ) => [ ] ) ;

  for ( let edgeIdx = 0; edgeIdx < totalEdges; edgeIdx++ ) {
    isInitialNode[ edgeConnections[edgeIdx][0] ] = false ;
    parentToChildMap[ edgeConnections[edgeIdx][1] ].push( edgeConnections[edgeIdx][0] ) ;
  }

  let resultRounds = -1 ;
  let currentProcessingQueue = [ ] ;

  for ( let nodeIdentifier = 1; nodeIdentifier <= totalNodes; nodeIdentifier++ ) {
    if ( isInitialNode[nodeIdentifier] ) {
      currentProcessingQueue.push( nodeIdentifier ) ;
    }
  }

  while ( currentProcessingQueue.length > 0 ) {
    let nextRoundQueue = [ ] ;
    let nodesVisitedThisRound = new Array( totalNodes + 1 ).fill( false ) ;
    resultRounds++ ;

    for ( let queueIdx = 0; queueIdx < currentProcessingQueue.length; queueIdx++ ) {
      if ( nodesVisitedThisRound[ currentProcessingQueue[queueIdx] ] ) {
        continue ;
      }
      nodesVisitedThisRound[ currentProcessingQueue[queueIdx] ] = true ;
      nextRoundQueue.push( ...parentToChildMap[ currentProcessingQueue[queueIdx] ] ) ;
    }
    currentProcessingQueue = nextRoundQueue ;
  }

  return resultRounds ;
}