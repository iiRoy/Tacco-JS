"use strict" ;

var dataStream = obtainModule("fileSystem") . obtainFileContents ( "/dev/stdin", "utf8" ) ;
var tokenArray = dataStream . split ( / |\n/ ) , tokenIndex = 0 ;

function getNextNumber ( ) {
  return + tokenArray [ tokenIndex ++ ] ;
}

function getNextString ( ) {
  return tokenArray [ tokenIndex ++ ] ;
}

function getNextLargeInt ( ) {
  return BigInt ( tokenArray [ tokenIndex ++ ] ) ;
}

function getMultiple ( count , asStrings ) {
  return asStrings
    ? tokenArray . slice ( tokenIndex , tokenIndex += count )
    : tokenArray . slice ( tokenIndex , tokenIndex += count ) . map ( val => + val ) ;
}

function getSortedNumbers ( numCount , descending ) {
  return descending
    ? tokenArray . slice ( tokenIndex , tokenIndex += numCount ) . map ( val => + val ) . sort ( ( aVal , bVal ) => bVal - aVal )
    : tokenArray . slice ( tokenIndex , tokenIndex += numCount ) . map ( val => + val ) . sort ( ( aVal , bVal ) => aVal - bVal ) ;
}

function getMatrix ( rows , cols , asText ) {
  var resultMatrix = [ ] , rowCounter = 0 ;
  if ( asText ) {
    for ( ; rowCounter < rows ; rowCounter ++ ) {
      resultMatrix . push ( tokenArray . slice ( tokenIndex , tokenIndex += cols ) ) ;
    }
  } else {
    for ( ; rowCounter < rows ; rowCounter ++ ) {
      resultMatrix . push ( tokenArray . slice ( tokenIndex , tokenIndex += cols ) . map ( val => + val ) ) ;
    }
  }
  return resultMatrix ;
}

function createMultiDimArray ( initialValue ) {
  var dimensions = arguments , dimLength = dimensions . length , resultString = "Array(dimensions[" + -- dimLength + "]).fill().map(elem=>{return " + initialValue + ";})" ;
  while ( -- dimLength ) {
    resultString = "Array(dimensions[" + dimLength + "]).fill().map(elem=>" + resultString + ")" ;
  }
  return eval ( resultString ) ;
}

var outputBuffer = [ ] ;
function appendToOutput ( textToAppend ) {
  outputBuffer . push ( textToAppend ) ;
}

var defaultValue = 0 ;

function RangeQueryTree ( initialSize ) {
  var powerOfTwo = 2 ;
  initialSize -- ;
  while ( initialSize ) {
    initialSize >>= 1 ;
    powerOfTwo <<= 1 ;
  }
  this . treeNodes = Array ( powerOfTwo - 1 ) . fill ( defaultValue ) ;
  this . leafOffset = powerOfTwo >> 1 ;
}

RangeQueryTree . prototype = {
  retrieveMaximum : function ( queryIndex ) {
    var nodeValues = this . treeNodes ;
    queryIndex += this . leafOffset - 1 ;
    var currentMax = defaultValue ;
    while ( queryIndex >= 0 ) {
      if ( nodeValues [ queryIndex ] > currentMax ) {
        currentMax = nodeValues [ queryIndex ] ;
      }
      queryIndex = ( queryIndex - 1 ) >> 1 ;
    }
    return currentMax ;
  },

  applyUpdate : function ( startIndex , endIndex , newValue ) {
    if ( startIndex >= endIndex ) {
      return ;
    }
    var instanceRef = this ;
    performRecursiveUpdate ( startIndex , endIndex , 0 , this . leafOffset , 0 ) ;

    function performRecursiveUpdate ( rangeStart , rangeEnd , nodeLow , nodeHigh , nodeIndex ) {
      if ( rangeStart === nodeLow && rangeEnd === nodeHigh ) {
        if ( instanceRef . treeNodes [ nodeIndex ] < newValue ) {
          instanceRef . treeNodes [ nodeIndex ] = newValue ;
        }
        return ;
      }
      var midPoint = ( nodeLow + nodeHigh ) >> 1 ;
      if ( midPoint < rangeEnd ) {
        if ( rangeStart < midPoint ) {
          performRecursiveUpdate ( rangeStart , midPoint , nodeLow , midPoint , nodeIndex + nodeIndex + 1 ) ;
          performRecursiveUpdate ( midPoint , rangeEnd , midPoint , nodeHigh , ( nodeIndex + 1 ) << 1 ) ;
        } else {
          performRecursiveUpdate ( rangeStart , rangeEnd , midPoint , nodeHigh , ( nodeIndex + 1 ) << 1 ) ;
        }
      } else {
        performRecursiveUpdate ( rangeStart , rangeEnd , nodeLow , midPoint , nodeIndex + nodeIndex + 1 ) ;
      }
    }
  },
} ;

var finalResult = executeProgram ( ) ;
if ( finalResult !== undefined ) {
  console . log ( String ( finalResult ) ) ;
}
if ( outputBuffer . length ) {
  console . log ( outputBuffer . join ( "\n" ) ) ;
}

function executeProgram ( ) {
  var [ itemCount , rangeExtent ] = getMultiple ( 2 ) ;
  var inputValues = getMultiple ( itemCount ) ;
  var segmentStructure = new RangeQueryTree ( 300001 ) ;

  for ( var dataIterator = 0 ; dataIterator < itemCount ; dataIterator ++ ) {
    var lowerBound = Math . max ( 0 , inputValues [ dataIterator ] - rangeExtent ) ;
    var upperBound = Math . min ( 300000 , inputValues [ dataIterator ] + rangeExtent ) ;
    var currentMaxVal = segmentStructure . retrieveMaximum ( inputValues [ dataIterator ] ) ;
    segmentStructure . applyUpdate ( lowerBound , upperBound + 1 , currentMaxVal + 1 ) ;
  }

  var finalAnswer = 0 ;
  for ( var dataIterator = 0 ; dataIterator <= 300000 ; dataIterator ++ ) {
    finalAnswer = Math . max ( finalAnswer , segmentStructure . retrieveMaximum ( dataIterator ) ) ;
  }
  return finalAnswer ;
}