var INPUT_HANDLER_MODULE = ( function ( ) {
  function createParserInstance ( sourceText ) {
    return new InputDataParser ( sourceText );
  }

  function InputDataParser ( rawSource ) {
    this._sourceLines = rawSource.trim().split( "\n" );
    this._currentLinePointer = 0;
  }

  InputDataParser.prototype.extractNextToken = function ( asString ) {
    var currentSource = this._sourceLines;
    var pointerIndex  = this._currentLinePointer;
    var tokenValue;

    if ( typeof currentSource[pointerIndex] === "string" ) {
      currentSource[pointerIndex] = currentSource[pointerIndex].split( " " ).reverse();
    }
    
    tokenValue = currentSource[pointerIndex].pop();

    if ( !currentSource[pointerIndex].length ) {
      this._currentLinePointer++;
    }

    return asString ? tokenValue : Number( tokenValue );
  };

  InputDataParser.prototype.readLineTokens = function ( returnStringsOnly ) {
    var lineTokens = this._sourceLines[this._currentLinePointer++].split( " " );
    
    return returnStringsOnly ? lineTokens : lineTokens.map( ( item ) => Number( item ) );
  };

  InputDataParser.prototype.readMatrixOfTokens = function ( numRows, rawOutput ) {
    var matrixData = this._sourceLines.slice( this._currentLinePointer, this._currentLinePointer += numRows ).map( ( row ) => row.split( " " ) );
    
    return rawOutput ? matrixData : matrixData.map( ( row ) => row.map( ( item ) => Number( item ) ) );
  };

  InputDataParser.prototype.readRawLines = function ( linesToRead, keepAsStrings ) {
    var extractedLines = this._sourceLines.slice( this._currentLinePointer, this._currentLinePointer += linesToRead );
    
    return keepAsStrings ? extractedLines : extractedLines.map( ( line ) => Number( line ) );
  };

  return createParserInstance;
} ) ( );

var inputProcessor = INPUT_HANDLER_MODULE( require( "node:fs" ).readFileSync( "/dev/stdin", "utf8" ) );

console.log( executeSolution( ) );

function executeSolution ( ) {
  var problemSize    = inputProcessor.extractNextToken( );
  var firstInputNum  = inputProcessor.extractNextToken( );
  var secondInputNum = inputProcessor.extractNextToken( );

  var totalSetBits = 0;

  for ( var bitIterator = 0; bitIterator < problemSize; bitIterator++ ) {
    var currentBitMask = 1 << bitIterator;
    
    if ( firstInputNum & currentBitMask ) {
      totalSetBits++;
    }
    
    if ( secondInputNum & currentBitMask ) {
      totalSetBits++;
    }
  }

  if ( totalSetBits % 2 === 0 ) {
    return "NO";
  }

  var finalResultArray = Array( 1 << problemSize );

  generateGrayCodePath( firstInputNum, secondInputNum, 0, 0 );

  console.log( "YES" );
  return finalResultArray.join( " " );

  function generateGrayCodePath ( currentValA, currentValB, usedBitMask, arrayOffset ) {
    if ( currentValA === currentValB ) {
      finalResultArray[arrayOffset] = currentValA;
      return;
    }

    var xorDifference    = currentValA ^ currentValB;
    var modifiedValA     = currentValA;
    var modifiedValB     = currentValA;
    var firstToggleFlag  = 1;
    var secondToggleFlag = 1;
    var fixedBitCount    = 0;

    for ( var bitIdx = 0; bitIdx < problemSize; bitIdx++ ) {
      var testBit = 1 << bitIdx;

      if ( testBit & usedBitMask ) {
        fixedBitCount++;
        continue;
      }

      if ( ( xorDifference & testBit ) === 0 ) {
        if ( firstToggleFlag ) {
          firstToggleFlag = 0;
          modifiedValA ^= testBit;
          modifiedValB ^= testBit;
        }
      } else {
        if ( secondToggleFlag ) {
          secondToggleFlag = 0;
          modifiedValB ^= testBit;
          usedBitMask |= testBit;
        }
      }
    }

    generateGrayCodePath( currentValA, modifiedValA, usedBitMask, arrayOffset );
    generateGrayCodePath( modifiedValB, currentValB, usedBitMask, arrayOffset + ( 1 << ( problemSize - fixedBitCount - 1 ) ) );
  }
}