var INPUT_PROCESSOR = ( function() {

  /**
   * Factory function to create a new InputSource instance.
   * @param {string} rawInputContent - The raw string content to be processed.
   * @returns {InputSource} A new instance of InputSource.
   */
  function createSourceHandler( rawInputContent ) {
    return new InputSource( rawInputContent );
  }

  /**
   * Constructor for the InputSource object.
   * Manages the raw input string, splitting it into lines and keeping track of the current reading position.
   * @param {string} fullInputString - The complete string content to parse.
   */
  function InputSource( fullInputString ) {
    this._textLines = fullInputString.trim().split( "\n" ); // Store all lines, stripped of leading/trailing whitespace.
    this._linePointer = 0; // Initialize pointer to the first line.
  }

  /**
   * Reads and extracts a single item from the current line.
   * If the current line is a string, it's split by spaces and reversed to allow popping from the end efficiently.
   * Moves to the next line if the current one becomes empty after extraction.
   * @param {boolean} giveAsString - If true, returns the item as a string; otherwise, attempts to convert to a number.
   * @returns {string|number} The extracted item.
   */
  InputSource.prototype.nextElement = function( giveAsString ) {
    var lineContent = this._textLines,
        lineIndex = this._linePointer,
        extractedItem;

    // Check if the current line needs to be processed (split and reversed for efficient popping).
    if ( typeof lineContent[ lineIndex ] === "string" ) {
      lineContent[ lineIndex ] = lineContent[ lineIndex ].split( " " ).reverse();
    }

    extractedItem = lineContent[ lineIndex ].pop(); // Get the last element from the current line's reversed array.

    // If the current line is now empty, advance the line pointer to the next line.
    if ( !lineContent[ lineIndex ].length ) {
      this._linePointer++;
    }

    // Return the item, optionally converted to a number.
    return giveAsString ? extractedItem : +extractedItem;
  };

  /**
   * Reads and processes an entire line of input.
   * Advances the line pointer after reading.
   * @param {boolean} preserveStringTypes - If true, returns items as strings; otherwise, converts all to numbers.
   * @returns {Array<string|number>} An array of items from the read line.
   */
  InputSource.prototype.fetchLine = function( preserveStringTypes ) {
    // Get the current line, split by spaces, and then increment the line pointer.
    var currentLineItems = this._textLines[ this._linePointer++ ].split( " " );

    // Return items as strings or mapped to numbers.
    return preserveStringTypes ? currentLineItems : currentLineItems.map( value => +value );
  };

  /**
   * Reads multiple lines and processes them as a 2D array (matrix).
   * Advances the line pointer by the number of lines read.
   * @param {number} lineCount - The number of lines to read.
   * @param {boolean} retainStringFormat - If true, keeps all items as strings; otherwise, converts all to numbers.
   * @returns {Array<Array<string|number>>} A 2D array of items.
   */
  InputSource.prototype.readGridFragment = function( lineCount, retainStringFormat ) {
    // Extract a slice of lines starting from the current pointer, then advance the pointer.
    var gridData = this._textLines.slice( this._linePointer, this._linePointer += lineCount )
                                .map( singleLine => singleLine.split( " " ) ); // Split each line by spaces.

    // Return the 2D array, optionally with all internal items converted to numbers.
    return retainStringFormat ? gridData : gridData.map( row => row.map( item => +item ) );
  };

  /**
   * Reads multiple lines and processes them as a 1D array.
   * Advances the line pointer by the number of lines read.
   * @param {number} numberOfLinesToExtract - The quantity of lines to retrieve.
   * @param {boolean} stringResult - If true, returns lines as strings; otherwise, converts each line to a number.
   * @returns {Array<string|number>} A 1D array of lines or numbers.
   */
  InputSource.prototype.extractLineBlock = function( numberOfLinesToExtract, stringResult ) {
    // Slice the specified number of lines from the source and update the line pointer.
    var lineBlock = this._textLines.slice( this._linePointer, this._linePointer += numberOfLinesToExtract );

    // Return the block, optionally with each line converted to a number.
    return stringResult ? lineBlock : lineBlock.map( lineStr => +lineStr );
  };

  return createSourceHandler; // Expose the factory function.

} )();


// Initialize the input handler by reading standard input.
var dataHandler = INPUT_PROCESSOR(
  require( "fs" ).readFileSync( "/dev/stdin", "utf8" )
);

/**
 * Dynamically constructs and evaluates code to create an N-dimensional array.
 * Each dimension's size is passed as an argument.
 * @param {any} defaultFillValue - The value to fill the innermost array elements with.
 * @param {...number} arrayDimensions - The sizes of the dimensions, from outermost to innermost.
 * @returns {Array} The newly created N-dimensional array.
 */
function createMultiDimensionalArray( defaultFillValue ) {
  var dimensionArguments = arguments,
      dimensionCount = dimensionArguments.length,
      arrayInitializationCode = "Array(dimensionArguments[" + --dimensionCount + "]).fill(0).map(element => { return " + defaultFillValue + "; })";

  // Build the nested array creation string.
  while ( --dimensionCount ) {
    arrayInitializationCode = "Array(dimensionArguments[" + dimensionCount + "]).fill(0).map(element => " + arrayInitializationCode + ")";
  }

  // Execute the generated code string to create the array.
  return eval( arrayInitializationCode );
}


// Output the result of the primary computation.
console.log( processMainLogic() );

/**
 * Contains the main application logic to generate a grid pattern.
 * Reads grid dimensions and pattern parameters from input, then constructs the grid.
 * @returns {string} The formatted grid as a string.
 */
function processMainLogic() {

  // Read grid dimensions and pattern parameters.
  var gridHeight = dataHandler.nextElement();
  var gridWidth = dataHandler.nextElement();
  var colStartThreshold = dataHandler.nextElement();
  var rowTogglePoint = dataHandler.nextElement();

  // Initialize the 2D grid with zeros.
  var resultGrid = createMultiDimensionalArray( 0, gridHeight, gridWidth );
  var toggleFlag = 0; // State variable for toggling pattern.

  // Iterate through rows and columns to populate the grid.
  for ( var rowIndex = 0; rowIndex < gridHeight; rowIndex++ ) {

    // Check if the current row is the toggle point.
    if ( rowIndex === rowTogglePoint ) {
      toggleFlag = 1; // Activate the toggle.
    }

    for ( var colIndex = 0; colIndex < gridWidth; colIndex++ ) {

      // Apply the column-based pattern: set to 1 if column index meets threshold.
      if ( colIndex >= colStartThreshold ) {
        resultGrid[ rowIndex ][ colIndex ] = 1;
      }

      // Apply the row-based toggle pattern: XOR with 1 if toggleFlag is active.
      if ( toggleFlag ) {
        resultGrid[ rowIndex ][ colIndex ] ^= 1;
      }

    } // End of column loop.
  } // End of row loop.

  // Format the resulting grid into a single string:
  // - Join elements of each inner array (row) without separators.
  // - Join the resulting row strings with newline characters.
  return resultGrid.map( rowArray => rowArray.join( "" ) ).join( "\n" );
}