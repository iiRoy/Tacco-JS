var inputParser = ( function ( ) {
  // This function facilitates parsing input data.
  function createParser( sourceContent ) {
    return new InputProcessor( sourceContent ) ;
  }
  // The core processor for handling input lines.
  function InputProcessor( textData ) {
    this . _sourceLines = textData . trim ( ) . split ( "\n" ) ;
    this . _linePointer = 0 ;
  }
  InputProcessor . prototype . extractNext = function ( returnRaw ) {
    var   _lines  =   this._sourceLines,
          _pointer = this._linePointer,
          retrievedData;
    // If the current line hasn't been processed into tokens yet, do so.
    if ( typeof _lines [ _pointer ] === "string" ) {
      _lines [ _pointer ] = _lines [ _pointer ] . split ( " " ) . reverse ( ) ;
    }
    retrievedData = _lines [ _pointer ] . pop ( ) ;
    // If the current line is now empty, advance to the next line.
    if ( ! _lines [ _pointer ] . length ) {
      this . _linePointer ++ ;
    }
    // Return the data as a string or a number based on the flag.
    return returnRaw ? retrievedData : + retrievedData ;
  } ;
  InputProcessor . prototype . readNextLine = function ( returnRaw ) {
    var lineTokens = this . _sourceLines [ this . _linePointer ++ ] . split ( " " ) ;
    return returnRaw ? lineTokens : lineTokens . map ( element => + element ) ;
  } ;
  InputProcessor . prototype . readMatrix = function ( numRows , returnRaw ) {
    var rawRows = this . _sourceLines . slice ( this . _linePointer , this . _linePointer + numRows ) . map ( rowEntry => rowEntry . split ( " " ) ) ;
    this . _linePointer += numRows ;
    return returnRaw ? rawRows : rawRows . map ( element => + element ) ;
  } ;
  InputProcessor . prototype . fetchRawLines = function ( numRows , returnRaw ) {
    var collectedLines = this . _sourceLines . slice ( this . _linePointer , this . _linePointer + numRows ) ;
    this . _linePointer += numRows ;
    return returnRaw ? collectedLines : collectedLines . map ( element => + element ) ;
  } ;
  // Export the parser creation function.
  return createParser ;
} ) ( ) ;

var dataHandler = inputParser ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

console . log ( processChallenge ( ) ) ;

function processChallenge ( ) {
  var affirmativeReply = "Yes" ;
  var negativeReply = "No" ;

  var numElements = dataHandler . extractNext ( ) ;
  var numericSequence = dataHandler . readNextLine ( ) ;
  var remainderBins = [ 0 , 0 , 0 ] ;

  for ( var iterator = 0 ; iterator < numElements ; iterator ++ ) {
    var moduloResult = numericSequence [ iterator ] % 4 ;
    if ( moduloResult === 0 ) {
      remainderBins [ 2 ] ++ ;
    } else if ( moduloResult === 2 ) {
      remainderBins [ 1 ] ++ ;
    } else {
      remainderBins [ 0 ] ++ ;
    }
  }

  if ( numElements === remainderBins [ 1 ] ) {
    return affirmativeReply ;
  }

  remainderBins [ 0 ] ++ ;

  if ( remainderBins [ 2 ] && remainderBins [ 0 ] <= remainderBins [ 2 ] + 1 ) {
    return affirmativeReply ;
  }

  return negativeReply ;
}