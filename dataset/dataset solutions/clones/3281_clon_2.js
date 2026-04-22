var DATA_PARSER = ( function() {
  function createInputReader ( sourceText ) { return new InputSource( sourceText ); }

  function InputSource ( rawText ) {
    this._lines = rawText.trim().split( "\n" );
    this._currentLineIndex = 0;
  }

  InputSource.prototype.readNextValue = function ( asString ) {
    var lineParts = this._lines,
        currentIndex = this._currentLineIndex,
        extractedItem;

    if ( typeof lineParts[ currentIndex ] === "string" ) {
      lineParts[ currentIndex ] = lineParts[ currentIndex ].split( " " ).reverse();
    }

    extractedItem = lineParts[ currentIndex ].pop();

    if ( !lineParts[ currentIndex ].length ) {
      this._currentLineIndex++;
    }

    return asString ? extractedItem : Number( extractedItem );
  };

  InputSource.prototype.readLineAsValues = function ( asString ) {
    var currentLineParts = this._lines[ this._currentLineIndex++ ].split( " " );
    return asString ? currentLineParts : currentLineParts.map( val => Number(val) );
  };

  InputSource.prototype.readMatrix = function ( numRows, asString ) {
    var matrixRows = this._lines.slice( this._currentLineIndex, this._currentLineIndex += numRows ).map( rowString => rowString.split( " " ) );
    return asString ? matrixRows : matrixRows.map( row => row.map( item => Number(item) ) );
  };

  InputSource.prototype.readRawLines = function ( numRows, asString ) {
    var selectedLines = this._lines.slice( this._currentLineIndex, this._currentLineIndex += numRows );
    return asString ? selectedLines : selectedLines.map( line => Number(line) );
  };

  return createInputReader;

} ) ();

var inputProcessor = DATA_PARSER( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );

console.log( processData() );

function processData () {

  var totalElements = inputProcessor.readNextValue();
  var thresholdA    = inputProcessor.readNextValue();
  var thresholdB    = inputProcessor.readNextValue();
  var dataPoints    = inputProcessor.readLineAsValues();

  var countBelowA = 0,
      countAboveB = 0;

  for ( var idx = 0; idx < totalElements; idx++ ) {
    if ( dataPoints[idx] <= thresholdA ) {
      countBelowA++;
    } else if ( dataPoints[idx] > thresholdB ) {
      countAboveB++;
    }
  }

  return Math.min( countBelowA, countAboveB, totalElements - countBelowA - countAboveB );
}