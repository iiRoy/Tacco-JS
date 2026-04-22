// Defines a utility class for parsing input data line by line.
function InputProcessor(sourceText)
{
  // Stores all input lines as an array of strings.
  this._inputLines = sourceText.split("\n");
  // Pointer to the current line being processed.
  this._currentLineIndex = 0;
};

// Prototype methods for the InputProcessor class.
InputProcessor.prototype = {

  // Extracts a single token from the current line.
  // If 'asRawString' is true, returns the token as a string, otherwise as a number.
  grabToken: function(asRawString) {
    var
      // Reference to the array of input lines.
      allLines = this._inputLines,
      // Current line's index.
      currentIdx = this._currentLineIndex,
      // Variable to hold the extracted token.
      extractedPortion;

    // If the current line hasn't been split into tokens yet, do so and reverse it
    // so that 'pop()' extracts from the beginning of the original line.
    if ( typeof allLines[currentIdx] === "string" ) {
      allLines[currentIdx] = allLines[currentIdx].split(" ").reverse();
    }

    // Extract the last token from the (reversed) current line.
    extractedPortion = allLines[currentIdx].pop();

    // If the current line is now empty, advance to the next line.
    if ( !allLines[currentIdx].length ) {
      this._currentLineIndex++;
    }

    // Return the token, either as a string or parsed as a number.
    return asRawString ? extractedPortion : +extractedPortion;
  },

  // Reads an entire line and returns its tokens.
  // If 'keepStrings' is true, returns tokens as strings, otherwise as numbers.
  readTokensFromLine: function(keepStrings) {
    // Split the current line into tokens and then advance the line pointer.
    var lineTokens = this._inputLines[this._currentLineIndex++].split(" ");

    // Return tokens based on the 'keepStrings' flag.
    return keepStrings ? lineTokens : lineTokens.map( val => +val );
  },

  // Fetches multiple lines, processing each into an array of tokens.
  // 'numberOfLinesToRead' specifies how many lines to fetch.
  // If 'returnStrings' is true, tokens are kept as strings, otherwise converted to numbers.
  fetchBlocksOfLines: function(numberOfLinesToRead, returnStrings) {
    var
      // All input lines.
      theLines = this._inputLines,
      // Starting index for reading lines.
      currentLinePos = this._currentLineIndex,
      // Array to store the processed blocks.
      resultantBlocks = [],
      // Loop counter.
      iter = 0;

    // Process lines based on whether strings should be retained or converted to numbers.
    if ( returnStrings ) {
      for ( ; iter < numberOfLinesToRead; iter++ ) {
        resultantBlocks[iter] = theLines[currentLinePos + iter].split(" ");
      }
    } else {
      for ( ; iter < numberOfLinesToRead; iter++ ) {
        resultantBlocks[iter] = theLines[currentLinePos + iter].split(" ").map(element => +element);
      }
    }

    // Advance the line pointer by the number of lines read.
    this._currentLineIndex += numberOfLinesToRead;
    // Return the array of processed line blocks.
    return resultantBlocks;
  },
};

// Initialize the input handler by reading the entire stdin.
var dataHandler = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

// Define a modulus constant for arithmetic operations.
var mathModulo = 1000000000 + 7;

// Output the result of the main computation.
console.log(calculateFinalResult());

// Main function to perform the calculation.
function calculateFinalResult() {
  // Read grid dimensions and target column.
  var gridHeight = dataHandler.grabToken();
  var gridWidth  = dataHandler.grabToken();

  // Special case: if width is 1, there's only one path.
  if ( gridWidth === 1 ) {
    return 1;
  }

  var targetColumnIndex = dataHandler.grabToken();

  // Initialize a 2D array for dynamic programming, filled with zeros.
  // Dimensions are (height+1) x (width+1).
  var pathCountTable = Array(gridHeight + 1).fill(0).map( _ => Array(gridWidth + 1).fill(0) );

  // Base case: at row 0, column 1, there's 1 way to be there.
  pathCountTable[0][1] = 1;

  // Precomputed factors based on Fibonacci-like sequence for combinations.
  var combinatorialFactors = [1, 1, 2, 3, 5, 8, 13, 21, 34];

  // Iterate through each row (height).
  for ( var currentH = 1; currentH <= gridHeight; currentH++ ) {
    // Calculate paths for the first column (column 1).
    pathCountTable[currentH][1] = pathCountTable[currentH - 1][1] * combinatorialFactors[gridWidth - 1];
    pathCountTable[currentH][1] += pathCountTable[currentH - 1][2] * combinatorialFactors[gridWidth - 2];
    pathCountTable[currentH][1] %= mathModulo;

    // Calculate paths for intermediate columns (from 2 to width-1).
    for ( var currentW = 2; currentW < gridWidth; currentW++ ) {
      pathCountTable[currentH][currentW] = pathCountTable[currentH - 1][currentW - 1] * combinatorialFactors[currentW - 2] * combinatorialFactors[gridWidth - currentW];
      pathCountTable[currentH][currentW] += pathCountTable[currentH - 1][currentW] * combinatorialFactors[currentW - 1] * combinatorialFactors[gridWidth - currentW];
      pathCountTable[currentH][currentW] += pathCountTable[currentH - 1][currentW + 1] * combinatorialFactors[currentW - 1] * combinatorialFactors[gridWidth - currentW - 1];
      pathCountTable[currentH][currentW] %= mathModulo;
    }

    // Calculate paths for the last column (column 'width').
    pathCountTable[currentH][gridWidth] = pathCountTable[currentH - 1][gridWidth - 1] * combinatorialFactors[gridWidth - 2];
    pathCountTable[currentH][gridWidth] += pathCountTable[currentH - 1][gridWidth] * combinatorialFactors[gridWidth - 1];
    pathCountTable[currentH][gridWidth] %= mathModulo;
  }

  // Return the number of paths at the final height and target column.
  return pathCountTable[gridHeight][targetColumnIndex];
}