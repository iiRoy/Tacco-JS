"use strict";

// This module provides a utility for processing input data.
var INPUT_READER = ( function () {
  function createInputProcessor( textContent ) {
    return new InputProcessor( textContent );
  }

  function InputProcessor( rawText ) {
    this._linesOfData = rawText.trim().split( "\n" );
    this._currentLineIndex = 0;
  }

  InputProcessor.prototype.readNextValue = function ( returnAsString ) {
    var dataLines = this._linesOfData,
        lineNum = this._currentLineIndex,
        extractedValue;

    if ( typeof dataLines[ lineNum ] === "string" ) {
      dataLines[ lineNum ] = dataLines[ lineNum ].split( " " ).reverse();
    }

    extractedValue = dataLines[ lineNum ].pop();

    if ( !dataLines[ lineNum ].length ) {
      this._currentLineIndex++;
    }

    return returnAsString ? extractedValue : +extractedValue;
  };

  InputProcessor.prototype.readNextLine = function ( asStringArray ) {
    var lineParts = this._linesOfData[ this._currentLineIndex++ ].split( " " );
    return asStringArray ? lineParts : lineParts.map( item => +item );
  };

  InputProcessor.prototype.readMatrix = function ( numRows, asStringMatrix ) {
    var resultMatrix = this._linesOfData.slice( this._currentLineIndex, this._currentLineIndex += numRows ).map( rowStr => rowStr.split( " " ) );
    return asStringMatrix ? resultMatrix : resultMatrix.map( row => row.map( cell => +cell ) );
  };

  InputProcessor.prototype.readRows = function ( numRows, asStringArray ) {
    var resultArray = this._linesOfData.slice( this._currentLineIndex, this._currentLineIndex += numRows );
    return asStringArray ? resultArray : resultArray.map( item => +item );
  };

  return createInputProcessor;
} )();

// Instantiate the input parser for standard input
var inputParser = INPUT_READER( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );

// Function to generate multi-dimensional arrays initialized with a value
function makeMultiDimArray( initialValue ) {
  var dimensionArgs = arguments,
      argLength = dimensionArgs.length,
      arrayCreationCode = "Array(dimensionArgs[" + --argLength + "]).fill(0).map( _ => { return " + initialValue + "; })";

  while ( --argLength ) {
    arrayCreationCode = "Array(dimensionArgs[" + argLength + "]).fill(0).map( _ => " + arrayCreationCode + " )";
  }

  return eval( arrayCreationCode );
}

// Declare global variables for the graph structure and edge masks
var adjacencyList, edgeBitmasks;

// Invoke the primary solution function
var finalResult = solveProblem();

// Display the computed result if it's not undefined
if ( finalResult !== undefined ) {
  console.log( finalResult );
}

// The main function containing the problem's core logic
function solveProblem() {
  var numNodes = inputParser.readNextValue();
  var edgeStartNodes = [],
      edgeEndNodes = [];

  adjacencyList = makeMultiDimArray( "[]", numNodes );
  edgeBitmasks = makeMultiDimArray( 0, numNodes - 1 );

  for ( var idx = 0; idx < numNodes - 1; idx++ ) {
    var node1 = inputParser.readNextValue() - 1,
        node2 = inputParser.readNextValue() - 1;
    edgeStartNodes[ idx ] = Math.min( node1, node2 );
    edgeEndNodes[ idx ] = Math.max( node1, node2 );
    adjacencyList[ node1 ].push( node2 );
    adjacencyList[ node2 ].push( node1 );
  }

  var numQueries = inputParser.readNextValue();

  for ( var idx = 0; idx < numQueries; idx++ ) {
    var startNode = inputParser.readNextValue() - 1,
        targetNode = inputParser.readNextValue() - 1;
    var queryBitMask = 1 << idx;
    var pathNodes = depthFirstSearch( startNode, targetNode, -1, [] );

    for ( var pathIdx = 1; pathIdx < pathNodes.length; pathIdx++ ) {
      var minNode = Math.min( pathNodes[ pathIdx - 1 ], pathNodes[ pathIdx ] ),
          maxNode = pathNodes[ pathIdx - 1 ] + pathNodes[ pathIdx ] - minNode;

      for ( var edgeIdx = 0; ; edgeIdx++ ) {
        if ( edgeStartNodes[ edgeIdx ] === minNode && edgeEndNodes[ edgeIdx ] === maxNode ) {
          edgeBitmasks[ edgeIdx ] |= queryBitMask;
          break;
        }
      }
    }
  }

  var maxBitmask = 1 << numQueries;
  var dynamicProgrammingTable = makeMultiDimArray( 0, maxBitmask );
  dynamicProgrammingTable[ 0 ] = 1;

  for ( var edgeIdx = 0; edgeIdx < numNodes - 1; edgeIdx++ ) {
    var nextDPTable = makeMultiDimArray( 0, maxBitmask );
    for ( var currentMask = 0; currentMask < maxBitmask; currentMask++ ) {
      if ( edgeBitmasks[ edgeIdx ] === 0 ) {
        nextDPTable[ currentMask ] += dynamicProgrammingTable[ currentMask ] * 2;
      } else {
        nextDPTable[ currentMask | edgeBitmasks[ edgeIdx ] ] += dynamicProgrammingTable[ currentMask ];
        nextDPTable[ currentMask ] += dynamicProgrammingTable[ currentMask ];
      }
    }
    dynamicProgrammingTable = nextDPTable;
  }

  return dynamicProgrammingTable[ maxBitmask - 1 ];
}

// Performs a Depth-First Search to find a path between two nodes
function depthFirstSearch( currentNode, goalNode, parentNode, currentPath ) {
  currentPath.push( currentNode );
  if ( goalNode === currentNode ) {
    return currentPath;
  }

  for ( var neighborNode of adjacencyList[ currentNode ] ) {
    if ( neighborNode === parentNode ) {
      continue;
    }
    var foundPath = depthFirstSearch( neighborNode, goalNode, currentNode, currentPath );
    if ( foundPath ) {
      return foundPath;
    }
  }
  currentPath.pop();
}