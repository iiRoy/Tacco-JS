var INPUT_PARSER=( function () {
  function createParser( inputString ) {
    return new DataStream( inputString ) ;
  }

  function DataStream( sourceText ) {
    this._lines = sourceText.trim() .split( "\n" ) ;
    this._currentLineIndex = 0 ;
  }

  DataStream.prototype.readNextValue = function ( asStringFlag ) {
    var lines = this._lines ,
        lineIdx = this._currentLineIndex ,
        extractedValue ;
    if ( typeof lines[ lineIdx ] === "string" ) {
      lines[ lineIdx ] = lines[ lineIdx ] .split( " " ) .reverse() ;
    }
    extractedValue = lines[ lineIdx ] .pop() ;
    if ( ! lines[ lineIdx ] .length ) {
      this._currentLineIndex ++ ;
    }
    return asStringFlag ? extractedValue : + extractedValue ;
  } ;

  DataStream.prototype.readNextLine = function ( asStringFlag ) {
    var lineSegments = this._lines[ this._currentLineIndex ++ ] .split( " " ) ;
    return asStringFlag ? lineSegments : lineSegments .map( segment => + segment ) ;
  } ;

  DataStream.prototype.readMatrix = function ( rowCount , asStringFlag ) {
    var matrixRows = this._lines.slice( this._currentLineIndex , this._currentLineIndex += rowCount ) .map( rowText => rowText .split( " " ) ) ;
    return asStringFlag ? matrixRows : matrixRows .map( row => row .map( elementText => + elementText ) ) ;
  } ;

  DataStream.prototype.readRows = function ( count , asStringFlag ) {
    var extractedRows = this._lines.slice( this._currentLineIndex , this._currentLineIndex += count ) ;
    return asStringFlag ? extractedRows : extractedRows .map( rowText => + rowText ) ;
  } ;

  return createParser ;
} ) ( ) ;

var dataProcessor = INPUT_PARSER( require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" ) ) ;

function multiDimArray( initialValue ) {
  var argumentsList = arguments,
      argCount = argumentsList.length,
      arrayDefinition = "Array(argumentsList[" + --argCount + "]).fill(0).map(_ => {return " + initialValue + ";})" ;
  while ( --argCount ) {
    arrayDefinition = "Array(argumentsList[" + argCount + "]).fill(0).map(_ => " + arrayDefinition + ")" ;
  }
  return eval( arrayDefinition ) ;
}

function findInsertionPoint( sortedCollection, startIndex, endIndex, targetValue ) {
  for ( var midPoint; 1 < endIndex - startIndex; ) {
    midPoint = 0 | ( startIndex + endIndex ) / 2 ;
    if ( sortedCollection[ midPoint ] < targetValue ) {
      startIndex = midPoint ;
    } else {
      endIndex = midPoint ;
    }
  }
  return sortedCollection[ startIndex ] < targetValue ? endIndex : startIndex ;
}

processInputData();
function processInputData() {
  var itemCount = dataProcessor .readNextValue ( ) ;
  var targetCount = dataProcessor .readNextValue ( ) ;
  var inputValues = dataProcessor .readNextLine ( ) ;
  var valueIndices = { } ;
  for ( var idx = 0 ; idx < itemCount ; idx ++ ) {
    var currentVal = inputValues[idx];
    if ( valueIndices[ currentVal ] ) {
      valueIndices[ currentVal ] .push( idx ) ;
    } else {
      valueIndices[ currentVal ] = [ idx ] ;
    }
  }

  var resultSequence ;
  var firstMissingElement = findFirstUnique ( 0 ) ;

  if ( targetCount === 1 || firstMissingElement === -1 ) {
    printResult ( buildRemainingSequence ( 0 ) ) ;
    return ;
  }

  var uniqueSequencePrefix = [ , firstMissingElement ] ;
  var nextUnique;
  for ( var idx = 1 ; idx < targetCount ; idx ++ ) {
    var currentElement = uniqueSequencePrefix[ idx ] ;
    var position = findInsertionPoint( valueIndices[ currentElement ] , 0 , valueIndices[ currentElement ] .length , 0 ) ;
    nextUnique = findFirstUnique ( valueIndices[ currentElement ][ position ] + 1 ) ;
    if ( nextUnique === -1 ) {
      break ;
    }
    uniqueSequencePrefix .push( nextUnique ) ;
  }

  if ( nextUnique === -1 ) {
    idx ++ ;
  }
  var remainder = targetCount % idx ;
  if ( remainder === 0 ) {
    if ( firstMissingElement === -1 ) {
      return ;
    }
    var lastElement = uniqueSequencePrefix[ idx - 1 ] ;
    var lastPos = findInsertionPoint( valueIndices[ lastElement ] , 0 , valueIndices[ lastElement ] .length , 0 ) ;
    printResult ( buildRemainingSequence ( valueIndices[ lastElement ][ lastPos ] + 1 ) ) ;
    return ;
  }

  var finalStartPos ;
  if ( remainder === 1 ) {
    finalStartPos = 0 ;
  } else {
    var elemInPrefix = uniqueSequencePrefix[ remainder - 1 ] ;
    var elemPos = findInsertionPoint( valueIndices[ elemInPrefix ] , 0 , valueIndices[ elemInPrefix ] .length , 0 ) ;
    finalStartPos = valueIndices[ elemInPrefix ][ elemPos ] + 1 ;
  }
  printResult ( buildRemainingSequence ( finalStartPos ) ) ;


  function buildRemainingSequence( startPosition ) {
    resultSequence = [ ] ;
    for ( var currentIdx = startPosition ; currentIdx < itemCount ; currentIdx ++ ) {
      var currentVal = inputValues[ currentIdx ] ;
      var nextOccurIdx = findInsertionPoint ( valueIndices[ currentVal ] , 0 , valueIndices[ currentVal ] .length , currentIdx + 1 ) ;
      if ( nextOccurIdx !== valueIndices[ currentVal ] .length ) {
        currentIdx = valueIndices[ currentVal ][ nextOccurIdx ] ;
      } else {
        resultSequence .push( currentVal ) ;
      }
    }
    return resultSequence ;
  }

  function findFirstUnique( startPoint ) {
    for ( var currentSearchIdx = startPoint ; currentSearchIdx < itemCount ; currentSearchIdx ++ ) {
      var currentExaminedValue = inputValues[ currentSearchIdx ] ;
      var nextPosition = findInsertionPoint ( valueIndices[ currentExaminedValue ] , 0 , valueIndices[ currentExaminedValue ] .length , currentSearchIdx + 1 ) ;
      if ( nextPosition !== valueIndices[ currentExaminedValue ] .length ) {
        currentSearchIdx = valueIndices[ currentExaminedValue ][ nextPosition ] ;
      } else {
        return currentExaminedValue ;
      }
    }
    return -1 ;
  }
}
function printResult( outputArray ) {
  if ( outputArray .length ) {
    console .log( outputArray .join( " " ) ) ;
  }
}