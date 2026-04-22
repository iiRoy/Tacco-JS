/*
 *  Module for creating an input data parser.
 *  It parses input from a string, typically read from stdin.
 */
var INPUT_PROCESSOR_FACTORY = ( function ( ) {
  /**
   *  Creates a new parser instance from a raw input string.
   *  @param {string} sourceText - The raw input string to be processed.
   *  @returns {DataHandler} A new data handler object.
   */
  function createInputHandler ( sourceText ) {
    return new DataHandler ( sourceText );
  }

  /**
   *  Manages and processes input lines.
   *  @class
   *  @param {string} rawText - The input string containing newline-separated data.
   */
  function DataHandler ( rawText ) {
    this.parsedLines = rawText
      .trim ( )
      .split ( "\n" ); // Stores each line as an array element.
    this.lineIndexCursor = 0; // Tracks the current line being processed.
  }

  /**
   *  Extracts and returns the next single data point from the current line.
   *  Values are consumed from the end of a line (reversed order).
   *  Advances the line cursor if the current line becomes empty.
   *  @param {boolean} returnAsText - If true, the value is returned as a string; otherwise, it's converted to a number.
   *  @returns {(string|number)} The retrieved data point.
   */
  DataHandler.prototype.fetchNextDatum = function ( returnAsText ) {
    var allLines = this.parsedLines;
    var currentLineNum = this.lineIndexCursor;
    var fetchedDatum;

    // Lazily split and reverse the current line if it's still a single string.
    if ( typeof allLines[currentLineNum] === "string" ) {
      allLines[currentLineNum] = allLines[currentLineNum]
        .split ( " " )
        .reverse ( );
    }

    fetchedDatum = allLines[currentLineNum].pop ( ); // Get the last element (which was the first in original order).

    // If the current line has no more elements, move to the next line.
    if ( !allLines[currentLineNum].length ) {
      this.lineIndexCursor++;
    }

    return returnAsText ? fetchedDatum : +fetchedDatum; // Return as number or string based on flag.
  };

  /**
   *  Reads an entire line and returns its space-separated components.
   *  Always advances the line cursor.
   *  @param {boolean} asStringArray - If true, returns an array of strings; otherwise, an array of numbers.
   *  @returns {Array<(string|number)>} An array of values from the current line.
   */
  DataHandler.prototype.getLineComponents = function ( asStringArray ) {
    var lineParts = this.parsedLines[this.lineIndexCursor++]
      .split ( " " );
    return asStringArray ? lineParts : lineParts.map ( elem => +elem );
  };

  /**
   *  Reads multiple lines and organizes them into a two-dimensional array (matrix).
   *  Advances the line cursor by the number of rows read.
   *  @param {number} numberOfRows - The count of lines to read for the matrix.
   *  @param {boolean} preserveStrings - If true, matrix elements remain strings; otherwise, they are converted to numbers.
   *  @returns {Array<Array<(string|number)>>} The constructed matrix.
   */
  DataHandler.prototype.readDataMatrix = function ( numberOfRows, preserveStrings ) {
    var dataMatrix = this.parsedLines
      .slice ( this.lineIndexCursor, this.lineIndexCursor += numberOfRows )
      .map ( line => line.split ( " " ) );
    return preserveStrings ? dataMatrix : dataMatrix.map ( row => row.map ( item => +item ) );
  };

  /**
   *  Reads a specified number of consecutive lines as a one-dimensional array.
   *  Each line is treated as a single value.
   *  Advances the line cursor by the number of lines read.
   *  @param {number} countOfLines - The number of lines to read.
   *  @param {boolean} keepTextFormat - If true, returns values as strings; otherwise, as numbers.
   *  @returns {Array<(string|number)>} An array of values from the specified lines.
   */
  DataHandler.prototype.readLinesAsValues = function ( countOfLines, keepTextFormat ) {
    var lineResults = this.parsedLines
      .slice ( this.lineIndexCursor, this.lineIndexCursor += countOfLines );
    return keepTextFormat ? lineResults : lineResults.map ( val => +val );
  };

  return createInputHandler; // The factory function for creating DataHandler instances.

} ) ( );

// Initialize the input data handler by reading from standard input.
var dataReader = INPUT_PROCESSOR_FACTORY ( require ( "node:fs" )
  .readFileSync ( "/dev/stdin", "utf8" ) );

/**
 *  A utility function to dynamically create multi-dimensional arrays.
 *  (This function is defined but not actively used in the primary puzzle solving logic.)
 *  @param {*} defaultValue - The value to pre-fill array elements with.
 *  @returns {Array} A multi-dimensional array as specified by arguments.
 */
function createNDimensionalArray ( defaultValue ) {
  var allArguments = arguments;
  var argumentCount = allArguments.length;
  // Construct the string representation for array creation using `eval`.
  var arrayConstructionString = "Array(allArguments[" + --argumentCount + "]).fill(0).map(element => { return " + defaultValue + "; })";

  // Nest array creation calls for higher dimensions.
  while ( --argumentCount ) {
    arrayConstructionString = "Array(allArguments[" + argumentCount + "]).fill(0).map(element => " + arrayConstructionString + ")";
  }

  return eval ( arrayConstructionString ); // Execute the constructed string to build the array.
}

// Global variables representing the puzzle's state and parameters.
var maxMoveLength,
  destinationX,
  destinationY,
  currentPosX = 0,
  currentPosY = 0;

// Execute the puzzle solver and output its result to the console.
console.log ( runPathfindingPuzzle ( ) );

/**
 *  The core function that orchestrates the pathfinding puzzle.
 *  It calculates a sequence of moves to reach (destinationX, destinationY) from (0,0)
 *  using steps of 'maxMoveLength' length.
 *  @returns {string|number} A newline-separated string of coordinates representing the path, or an error code (0 or -1).
 */
function runPathfindingPuzzle ( ) {
  // Retrieve initial parameters from the input data.
  maxMoveLength = dataReader.fetchNextDatum ( );
  destinationX = dataReader.fetchNextDatum ( );
  destinationY = dataReader.fetchNextDatum ( );

  // Check for immediate termination conditions.
  if ( destinationX === 0 && destinationY === 0 ) {
    return 0; // Already at the target.
  }
  // Check for impossibility: if maxMoveLength is even, the sum of coordinates (destinationX + destinationY) must also be even.
  // Otherwise, it's impossible to reach.
  if ( maxMoveLength % 2 === 0 && ( destinationX + destinationY ) % 2 !== 0 ) {
    return -1; // Cannot reach the target due to parity mismatch.
  }

  var recordedPath = [ ]; // Array to store the sequence of visited coordinates.
  var doubleMoveLength = maxMoveLength * 2; // Pre-calculate 2 * maxMoveLength for efficiency.

  // Calculate the initial Manhattan distance to the target.
  var currentDistance = computeManhattanDistance ( );

  // Loop to make large steps until the distance is within a manageable range (<= 2 * maxMoveLength)
  // and the parity of the distance is suitable for termination.
  // The condition `currentDistance % 2` evaluates to true if `currentDistance` is odd.
  // If `maxMoveLength` is even, `currentDistance` will always be even, so `currentDistance % 2` is always false.
  // If `maxMoveLength` is odd, `currentDistance` will be odd or even depending on the number of moves taken so far.
  // The loop continues if `currentDistance` is odd (meaning an even number of steps have been made if `maxMoveLength` is odd).
  while ( currentDistance > doubleMoveLength || currentDistance % 2 ) {
    recordedPath.push ( takeOneStepTowardsTarget ( ) ); // Record the new position.
    currentDistance = computeManhattanDistance ( ); // Update distance after the move.
  }

  // After the loop, `currentDistance` is either 0, `maxMoveLength`, or something up to `2 * maxMoveLength`.
  // If `maxMoveLength` is odd, `currentDistance` must be even here (because `currentDistance % 2` was false to exit).

  // Check if the remaining distance is a perfect multiple of `maxMoveLength`.
  if ( currentDistance % maxMoveLength === 0 ) {
    // If it is, simply continue taking steps until the target is reached.
    while ( computeManhattanDistance ( ) > 0 ) {
      recordedPath.push ( takeOneStepTowardsTarget ( ) );
    }
  } else {
    // If not a perfect multiple, a special two-step adjustment is required.
    var tempTargetX = destinationX;
    var tempTargetY = destinationY;

    // Calculate the adjustment value for the intermediate point.
    var deltaAdjustment = ( doubleMoveLength - Math.abs ( currentPosX - destinationX ) - Math.abs ( currentPosY - destinationY ) ) / 2;

    // Determine the adjustment strategy based on which coordinate has a larger absolute difference.
    if ( Math.abs ( currentPosX - destinationX ) >= Math.abs ( currentPosY - destinationY ) ) {
      // Adjust Y coordinate for the intermediate point.
      if ( currentPosY < destinationY ) {
        destinationY = currentPosY - deltaAdjustment;
      } else {
        destinationY = currentPosY + deltaAdjustment;
      }
      // Adjust X coordinate for the intermediate point.
      if ( currentPosX < destinationX ) {
        destinationX = currentPosX + maxMoveLength - deltaAdjustment;
      } else {
        destinationX = currentPosX - maxMoveLength + deltaAdjustment;
      }
    } else {
      // Adjust X coordinate for the intermediate point.
      if ( currentPosX < destinationX ) {
        destinationX = currentPosX - deltaAdjustment;
      } else {
        destinationX = currentPosX + deltaAdjustment;
      }
      // Adjust Y coordinate for the intermediate point.
      if ( currentPosY < destinationY ) {
        destinationY = currentPosY + maxMoveLength - deltaAdjustment;
      } else {
        destinationY = currentPosY - maxMoveLength + deltaAdjustment;
      }
    }
    // Perform the first adjustment move to the intermediate point.
    recordedPath.push ( takeOneStepTowardsTarget ( ) );

    // Restore the original target coordinates for the second move.
    destinationX = tempTargetX;
    destinationY = tempTargetY;

    // Perform the second adjustment move to the final target.
    recordedPath.push ( takeOneStepTowardsTarget ( ) );
  }

  // Output the total number of moves made.
  console.log ( recordedPath.length );

  // Return the complete path as a newline-separated string.
  return recordedPath.join ( "\n" );
}

/**
 *  Calculates the Manhattan distance from the current position to the target destination.
 *  @returns {number} The Manhattan distance.
 */
function computeManhattanDistance ( ) {
  return Math.abs ( currentPosX - destinationX ) + Math.abs ( currentPosY - destinationY );
}

/**
 *  Executes a single move of `maxMoveLength` from the current position towards the target destination.
 *  Updates `currentPosX` and `currentPosY`.
 *  Prioritizes moving along the X-axis first, then the Y-axis with any remaining move length.
 *  @returns {string} The new coordinates (`currentPosX currentPosY`) as a space-separated string.
 */
function takeOneStepTowardsTarget ( ) {
  var remainingMoveBudget = maxMoveLength; // Total steps available for this move.

  // Handle movement along the X-axis.
  if ( destinationX < currentPosX ) {
    // Target X is to the left.
    if ( remainingMoveBudget >= currentPosX - destinationX ) {
      // Can cover or overshoot target X.
      remainingMoveBudget -= ( currentPosX - destinationX );
      currentPosX = destinationX; // Move current X directly to target X.
    } else {
      // Can only move part-way to target X.
      currentPosX -= remainingMoveBudget;
      remainingMoveBudget = 0; // All steps used on X-axis.
    }
  } else if ( destinationX > currentPosX ) {
    // Target X is to the right.
    if ( remainingMoveBudget >= destinationX - currentPosX ) {
      // Can cover or overshoot target X.
      remainingMoveBudget -= ( destinationX - currentPosX );
      currentPosX = destinationX; // Move current X directly to target X.
    } else {
      // Can only move part-way to target X.
      currentPosX += remainingMoveBudget;
      remainingMoveBudget = 0; // All steps used on X-axis.
    }
  }

  // If there's still move budget remaining, use it for the Y-axis.
  if ( remainingMoveBudget > 0 ) {
    if ( destinationY < currentPosY ) {
      // Target Y is downwards.
      currentPosY -= remainingMoveBudget;
    } else {
      // Target Y is upwards or at the same Y.
      currentPosY += remainingMoveBudget;
    }
  }

  return currentPosX + " " + currentPosY; // Return the new current coordinates.
}