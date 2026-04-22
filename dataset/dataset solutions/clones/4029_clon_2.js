/* This module provides a flexible input parsing utility, designed to read structured data. */
var InputReaderFactory = ( function() {

  // Main entry point for the module: creates and returns a new data reader instance.
  function createReader( rawData ) {
    return new DataReader( rawData );
  }

  // The DataReader class is responsible for parsing and navigating through the input string.
  function DataReader( inputString ) {
    // Stores all input lines as an array of strings, after trimming whitespace and splitting by newline.
    this._lines = inputString.trim().split( "\n" );
    // This pointer keeps track of the current line being processed within the input.
    this._currentLineIndex = 0;
  }

  // Reads a single token (word, separated by space) from the current line.
  // The 'asString' flag determines if the token should be returned as a string (true)
  // or converted to a number (false, default).
  DataReader.prototype.readToken = function( asString ) {
    var lineData = this._lines;
    var idx      = this._currentLineIndex;
    var tokenValue;

    // If the current line is still a single string, split it into tokens and reverse the array.
    // Reversing allows efficient extraction from the end using 'pop()'.
    if ( typeof lineData[ idx ] === "string" ) {
      lineData[ idx ] = lineData[ idx ].split( " " ).reverse();
    }

    // Extract the last token from the processed line array.
    tokenValue = lineData[ idx ].pop();

    // If the current line has been fully consumed (no more tokens), advance to the next line.
    if ( !lineData[ idx ].length ) {
      this._currentLineIndex++;
    }

    // Return the token, applying numeric conversion if 'asString' is false.
    return asString ? tokenValue : +tokenValue;
  };

  // Reads an entire line and returns its constituent tokens.
  // If 'keepStrings' is true, tokens are returned as strings; otherwise, they are converted to numbers.
  DataReader.prototype.readLineTokens = function( keepStrings ) {
    // Retrieve the current line, split it by spaces into an array of parts, and then increment the line index.
    var lineParts = this._lines[ this._currentLineIndex++ ].split( " " );
    // Based on 'keepStrings', return either the array of string parts or an array of numeric parts.
    return keepStrings ? lineParts : lineParts.map( function( item ) { return +item; } );
  };

  // Reads a specified number of lines and structures them as a 2D array (matrix).
  // 'numRows' dictates how many consecutive lines to read.
  // 'preserveTypes' controls whether the matrix elements remain strings or are converted to numbers.
  DataReader.prototype.readMatrix = function( numRows, preserveTypes ) {
    // Extract a slice of 'numRows' lines from the input, then map each line to an array of its space-separated tokens.
    var extractedRows = this._lines
      .slice( this._currentLineIndex, ( this._currentLineIndex += numRows ) )
      .map( function( row ) { return row.split( " " ); } );

    // If 'preserveTypes' is false, iterate through the matrix and convert all elements to numbers.
    return preserveTypes ? extractedRows : extractedRows.map( function( row ) {
      return row.map( function( element ) { return +element; } );
    } );
  };

  // Reads a specified number of raw lines from the input.
  // 'count' defines how many lines to retrieve.
  // 'retainFormat' determines if lines should remain as strings or be attempted conversion to numbers.
  DataReader.prototype.readRawLines = function( count, retainFormat ) {
    // Obtain a segment of 'count' lines from the input array, then update the line index.
    var selectedLines = this._lines.slice( this._currentLineIndex, ( this._currentLineIndex += count ) );
    // Return the lines, optionally converting each to a number if 'retainFormat' is false.
    return retainFormat ? selectedLines : selectedLines.map( function( line ) { return +line; } );
  };

  // The factory function that initiates the creation of a DataReader.
  return createReader;
} )();

// Initialize the data processing object by reading the entire content of standard input.
var dataProcessor = InputReaderFactory( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );

// Execute the central problem-solving logic and output its result to the console.
console.log( executeProblemLogic() );

// This function contains the primary business logic for the specific problem.
function executeProblemLogic() {
  // Read a 3-row matrix from the input using the data processor.
  var inputGrid = dataProcessor.readMatrix( 3 );

  // Calculate the difference between the first column elements of the second and first rows.
  var rowDifference = inputGrid[ 1 ][ 0 ] - inputGrid[ 0 ][ 0 ];

  // Define the string for a negative outcome.
  var negativeOutcome = "No";

  // Check if the calculated 'rowDifference' consistently applies to the second and third columns
  // when comparing the first and second rows. If not, the condition is not met.
  if (
       rowDifference + inputGrid[ 0 ][ 1 ] !== inputGrid[ 1 ][ 1 ]
    || rowDifference + inputGrid[ 0 ][ 2 ] !== inputGrid[ 1 ][ 2 ]
  ) {
    return negativeOutcome; // Return "No" if the pattern is broken.
  }

  // Recalculate the difference, now comparing the first column elements of the third and first rows.
  rowDifference = inputGrid[ 2 ][ 0 ] - inputGrid[ 0 ][ 0 ];

  // Perform a similar consistency check for the third row against the first row,
  // using the newly calculated 'rowDifference'.
  if (
       rowDifference + inputGrid[ 0 ][ 1 ] !== inputGrid[ 2 ][ 1 ]
    || rowDifference + inputGrid[ 0 ][ 2 ] !== inputGrid[ 2 ][ 2 ]
  ) {
    return negativeOutcome; // Return "No" if this pattern is also broken.
  }

  // If both sets of checks pass, it implies the specific pattern holds true across the rows.
  return "Yes";
}