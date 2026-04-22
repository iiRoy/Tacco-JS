// This section handles standard input/output and provides utility functions.
let   inputReader  = require('node:readline').createInterface({
  input:  process.stdin,
  output: process.stdout
});
let dataStore;
let inputLines = [ ];

inputReader.on( 'line', function ( currentLine )
{
  inputLines.push( currentLine );
} );

inputReader.on( 'close', function ( ) {
  dataStore = initializeParser( inputLines );
  process.stderr.write( '\n' );
  let startTimeStamp = performance.now();
  ExecutePrincipalLogic();
  let durationMillis = performance.now() - startTimeStamp;
  logDebugMessage( 'elapsed time : ' + durationMillis.toFixed(3) + 'ms' );
  logDebugMessage( 'memory footprint : ' + Math.round( process.memoryUsage().heapTotal / 1024 ) + 'KB' );
} );

function createDeepCopy( sourceObject )
{
  return ( sourceObject instanceof Set )
         ? new Set( Array.from( sourceObject ) )
         : JSON.parse( JSON.stringify( sourceObject ) )
  ;
}

function retrieveNextInteger ( )
{
  return convertInput( fetchNextItem(), 1 );
}

function retrieveNextStringArray ( )
{
  return convertInput( fetchNextItem(), 2 );
}

function retrieveNextIntegerArray ( )
{
  return convertInput( fetchNextItem(), 4 );
}

function retrieveNextCharacterArray ( )
{
  return convertInput( fetchNextItem(), 6 );
}

function fetchNextItem ( )
{
  return dataStore.fetchItem();
}

function hasMoreItems ( )
{
  return dataStore.hasAvailableItems();
}

function initializeParser ( inputSegments )
{
  return {
    segmentList : inputSegments,
    currentPosition : 0,
    maximumItems : inputSegments.length,
    hasAvailableItems : function ( ) {
      return ( this.currentPosition < this.maximumItems );
    },
    fetchItem : function ( ) {
      if ( this.hasAvailableItems() )
      {
        return this.segmentList[ this.currentPosition++ ];
      }
      else
      {
        throw new Error( 'InputBufferEmptyException: No further input available' );
      }
    }
  };
}

function printOutput ( content )
{
  process.stdout.write( content + '\n' );
}

function logDebugMessage ( message )
{
  process.stderr.write( 'DEBUG: ' + require('node:util').inspect( message, { showHidden: false, depth: null, colors: true } ) + '\n' );
}

// The 'conversionType' parameter dictates the transformation:
// 1: Parses to integer.
// 2: Splits by spaces into strings.
// 4: Splits by spaces and maps to numbers.
// 6: Splits into individual characters.
// 7: Splits into characters and maps to numbers.
// 8: Joins array elements with spaces.
// 9: Joins array elements with newlines.
// 0: Joins array elements without delimiters.
// Otherwise: Returns input unchanged.
function convertInput ( inputData, conversionType )
{
  try
  {
    switch ( conversionType )
    {
      case 1:
        return Number.parseInt( inputData );
      case 2:
        return inputData.split( ' ' );
      case 4:
        return inputData.split( ' ' ).map( Number );
      case 6:
        return inputData.split( '' );
      case 7:
        return inputData.split( '' ).map( Number );
      case 8:
        return inputData.join( ' ' );
      case 9:
        return inputData.join( '\n' );
      case 0:
        return inputData.join( '' );
      default:
        return inputData;
    }
  }
  catch ( error )
  {
    return inputData;
  }
}

// End of common utility functions.
function ExecutePrincipalLogic() {
  let nodeCount = retrieveNextInteger();
  let nodeInformation = new Array(nodeCount);
  let resultSequence = new Array(nodeCount);

  for (let k = 0; k < nodeCount; k++) {
    nodeInformation[k] = {
      nodeDepth: null,
      isVisited: false,
      connectedNodes: [],
      assignedValue: -1
    };
  }

  let firstCounter = 1;
  let secondCounter = 2;
  let thirdCounter = 3;

  for (let linkIdx = 0; linkIdx < nodeCount - 1; linkIdx++) {
    let edgeData = retrieveNextIntegerArray();
    nodeInformation[edgeData[0] - 1].connectedNodes.push(edgeData[1] - 1);
    nodeInformation[edgeData[1] - 1].connectedNodes.push(edgeData[0] - 1);
  }

  let processingQueue = [0];
  nodeInformation[0].isVisited = true;
  nodeInformation[0].nodeDepth = 1;

  let oddLevelCount = 0;
  let evenLevelCount = 0;

  while (processingQueue.length > 0) {
    let currentNodeIndex = processingQueue.shift();

    if (nodeInformation[currentNodeIndex].nodeDepth % 2 === 1) {
      oddLevelCount++;
    } else {
      evenLevelCount++;
    }

    let childrenIndices = nodeInformation[currentNodeIndex].connectedNodes;
    for (let cIdx = 0; cIdx < childrenIndices.length; cIdx++) {
      if (!nodeInformation[childrenIndices[cIdx]].isVisited) {
        nodeInformation[childrenIndices[cIdx]].isVisited = true;
        nodeInformation[childrenIndices[cIdx]].nodeDepth = nodeInformation[currentNodeIndex].nodeDepth + 1;
        processingQueue.push(childrenIndices[cIdx]);
      }
    }
  }

  if (oddLevelCount > (nodeCount / 3) && evenLevelCount > (nodeCount / 3)) {
    for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
      if (nodeInformation[nodeIdx].nodeDepth % 2 === 1) {
        if (firstCounter <= nodeCount) {
          nodeInformation[nodeIdx].assignedValue = firstCounter;
          firstCounter += 3;
        }
      } else {
        if (secondCounter <= nodeCount) {
          nodeInformation[nodeIdx].assignedValue = secondCounter;
          secondCounter += 3;
        }
      }
    }
  } else {
    for (let currNode = 0; currNode < nodeCount; currNode++) {
      if (oddLevelCount < evenLevelCount) {
        if (nodeInformation[currNode].nodeDepth % 2 === 1) {
          nodeInformation[currNode].assignedValue = thirdCounter;
          thirdCounter += 3;
        }
      } else {
        if (nodeInformation[currNode].nodeDepth % 2 === 0) {
          nodeInformation[currNode].assignedValue = thirdCounter;
          thirdCounter += 3;
        }
      }
    }
  }

  for (let finalIdx = 0; finalIdx < nodeCount; finalIdx++) {
    if (nodeInformation[finalIdx].assignedValue === -1) {
      if (firstCounter <= nodeCount) {
        nodeInformation[finalIdx].assignedValue = firstCounter;
        firstCounter += 3;
      } else if (secondCounter <= nodeCount) {
        nodeInformation[finalIdx].assignedValue = secondCounter;
        secondCounter += 3;
      } else if (thirdCounter <= nodeCount) {
        nodeInformation[finalIdx].assignedValue = thirdCounter;
        thirdCounter += 3;
      }
    }
    resultSequence[finalIdx] = nodeInformation[finalIdx].assignedValue;
  }

  printOutput(convertInput(resultSequence, 8));
}