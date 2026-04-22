/*
 * This self-executing function creates and returns an input parsing utility.
 * It provides methods to read various types of data from a multi-line string input.
 */
var DATA_READER = ( function ( ) {
  /**
   * Factory function to create an instance of the InputParser.
   * @param {string} inputString Raw string data to be parsed.
   * @returns {InputParser} A new parser instance.
   */
  function createReader ( inputString ) {
    return new InputParser( inputString ) ;
  }

  /**
   * Constructor for the InputParser class.
   * Initializes the internal buffer with lines from the input string.
   * @param {string} rawInputString The complete input string.
   */
  function InputParser ( rawInputString ) {
    // Store lines after trimming whitespace and splitting by newline characters.
    this . lineBuffer = rawInputString . trim ( ) . split ( "\n" ) ;
    // Initialize the index for the current line being processed.
    this . currentLineIndex = 0 ;
  }

  /**
   * Reads a single value from the current line. If the line is not yet split,
   * it splits it by space and reverses to pop values from the right.
   * Advances the line index if the current line becomes empty.
   * @param {boolean} [returnAsString=false] If true, returns the value as a string; otherwise, as a number.
   * @returns {string|number} The extracted value.
   */
  InputParser . prototype . readSingleValue = function ( returnAsString ) {
    var lineContentArray = this . lineBuffer,
        currentLinePosition = this . currentLineIndex,
        poppedItem ;

    // If the current line is still a string, split it into segments and reverse.
    // Reversing allows popping from the end, which is more efficient than shifting from the beginning.
    if ( typeof lineContentArray [ currentLinePosition ] === "string" ) {
      lineContentArray [ currentLinePosition ] = lineContentArray [ currentLinePosition ] . split ( " " ) . reverse ( ) ;
    }

    // Extract the last segment from the current line's array.
    poppedItem = lineContentArray [ currentLinePosition ] . pop ( ) ;

    // If the current line is now empty, advance to the next line.
    if ( ! lineContentArray [ currentLinePosition ] . length ) {
      this . currentLineIndex ++ ;
    }

    // Return the item, parsed as a number if returnAsString is false/falsy.
    return returnAsString ? poppedItem : + poppedItem ;
  } ;

  /**
   * Reads all values from the current line as an array.
   * Advances the line index after reading.
   * @param {boolean} [returnAsString=false] If true, returns values as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of values from the line.
   */
  InputParser . prototype . readAllOnLine = function ( returnAsString ) {
    // Split the current line by spaces and increment the line index.
    var lineParts = this . lineBuffer [ this . currentLineIndex ++ ] . split ( " " ) ;

    // Return as strings or map to numbers.
    return returnAsString ? lineParts : lineParts . map ( item => + item ) ;
  } ;

  /**
   * Reads a specified number of lines as a matrix (array of arrays).
   * Advances the line index by the number of lines read.
   * @param {number} numberOfLines The count of lines to read for the matrix.
   * @param {boolean} [returnAsString=false] If true, returns values as strings; otherwise, as numbers.
   * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
   */
  InputParser . prototype . readMatrix = function ( numberOfLines, returnAsString ) {
    // Slice the required number of lines, then map each line string to an array of its segments.
    var matrixRows = this . lineBuffer . slice ( this . currentLineIndex, this . currentLineIndex += numberOfLines ) . map ( rowString => rowString . split ( " " ) ) ;

    // If numerical conversion is required, apply it to all elements in the matrix.
    return returnAsString ? matrixRows : matrixRows . map ( rowString => rowString . map ( elementString => + elementString ) ) ;
  } ;

  /**
   * Reads a specified number of lines and returns them as an array.
   * Advances the line index by the number of lines read.
   * @param {number} numberOfLines The count of lines to read.
   * @param {boolean} [returnAsString=false] If true, returns lines as strings; otherwise, each line converted to a number.
   * @returns {Array<string|number>} An array of lines.
   */
  InputParser . prototype . readLines = function ( numberOfLines, returnAsString ) {
    // Get a slice of lines from the buffer and update the current line index.
    var dataLines = this . lineBuffer . slice ( this . currentLineIndex, this . currentLineIndex += numberOfLines ) ;

    // Return as strings or map each line to a number.
    return returnAsString ? dataLines : dataLines . map ( lineString => + lineString ) ;
  } ;

  // Return the factory function to create parser instances.
  return createReader ;

} ) ( ) ; // End of DATA_READER module

/*
 * Initialize the input processor by reading standard input.
 * Uses Node.js 'fs' module to read the entire file synchronously.
 */
var inputProcessor = DATA_READER ( require ( "node:fs" ) . readFileSync ( "/dev/stdin", "utf8" ) ) ;

/**
 * Creates a multi-dimensional array dynamically based on provided dimensions.
 * This is a utility function to generate arrays like `Array(d1).fill(0).map(() => Array(d2).fill(0)...)`.
 * @param {*} initialValue The value to initialize each element with.
 * @param {...number} dimensions Variable number of arguments representing array dimensions.
 * @returns {Array} The generated multi-dimensional array.
 */
function createMultiDimArray ( initialValue ) {
  var dimensions = arguments,
      dimCount = dimensions . length,
      arrayCreationCode = "Array(dimensions[" + -- dimCount + "]) . fill ( 0 ) . map ( x => { return " + initialValue + " ; } )" ;

  // Build the array creation string from innermost to outermost dimension.
  while ( -- dimCount ) {
    arrayCreationCode = "Array(dimensions[" + dimCount + "]) . fill ( 0 ) . map ( x => " + arrayCreationCode + " )" ;
  }
  // Evaluate the constructed string to create the array.
  return eval ( arrayCreationCode ) ;
}

// Global variables for storing parsed input data and derived properties.
var totalPointsCount,
    xCoordinates = [ ], // Array to store X-coordinates of points.
    yCoordinates = [ ] ; // Array to store Y-coordinates of points.

/*
 * The main execution block. Calls the primary calculation function and prints its result.
 */
console . log ( calculateMaxDistance ( ) ) ;

/**
 * Main function to process input coordinates, find the maximum squared Euclidean distance
 * from the origin for points projected onto lines, and return the square root of this maximum.
 * @returns {number} The square root of the maximum squared distance.
 */
function calculateMaxDistance ( ) {
  // Read the initial count of points.
  totalPointsCount = inputProcessor . readSingleValue ( ) ;

  // Loop to read all coordinate pairs.
  for ( var pointIndex = 0 ; pointIndex < totalPointsCount ; pointIndex ++ ) {
    var currentX = inputProcessor . readSingleValue ( ),
        currentY = inputProcessor . readSingleValue ( ) ;

    // Skip points that are at the origin (0,0) as they don't contribute to the sum.
    if ( currentX === 0 && currentY === 0 ) {
      continue ;
    }

    // Store the valid coordinates.
    xCoordinates . push ( currentX ) ;
    yCoordinates . push ( currentY ) ;
  }

  // Update totalPointsCount to reflect only the valid, non-origin points.
  totalPointsCount = xCoordinates . length ;

  // Initialize the maximum squared distance found so far.
  var maximumSquaredDistance = 0 ;

  // Iterate through a range of possible line parameters (h, w).
  // The original problem likely involves finding the maximum squared sum of projections
  // onto various lines defined by (h,w) where h or w are fixed to large values or 'i'.
  for ( var coordinateValue = -1000000 ; coordinateValue <= 1000000 ; coordinateValue += 20 ) {
    // Test various line orientations by fixing one component to a boundary and varying the other,
    // or by varying one component and fixing the other to a boundary.
    // This forms a grid-like search over a large parameter space.

    // Case 1: Line with fixed horizontalComponent = -1000000, varying verticalComponent.
    var currentSquaredDistance = computeProjectionSquaredLength ( -1000000, coordinateValue ) ;
    if ( maximumSquaredDistance < currentSquaredDistance ) {
      maximumSquaredDistance = currentSquaredDistance ;
    }

    // Case 2: Line with fixed horizontalComponent = 1000000, varying verticalComponent.
    currentSquaredDistance = computeProjectionSquaredLength ( 1000000, coordinateValue ) ;
    if ( maximumSquaredDistance < currentSquaredDistance ) {
      maximumSquaredDistance = currentSquaredDistance ;
    }

    // Case 3: Line with fixed verticalComponent = 1000000, varying horizontalComponent.
    currentSquaredDistance = computeProjectionSquaredLength ( coordinateValue, 1000000 ) ;
    if ( maximumSquaredDistance < currentSquaredDistance ) {
      maximumSquaredDistance = currentSquaredDistance ;
    }

    // Case 4: Line with fixed verticalComponent = -1000000, varying horizontalComponent.
    currentSquaredDistance = computeProjectionSquaredLength ( coordinateValue, -1000000 ) ;
    if ( maximumSquaredDistance < currentSquaredDistance ) {
      maximumSquaredDistance = currentSquaredDistance ;
    }
  }

  // The problem asks for the square root of the maximum squared sum of projections.
  return Math . sqrt ( maximumSquaredDistance ) ;
}

/**
 * Computes the squared Euclidean length of the sum of projected vectors (x[i], y[i])
 * onto a line defined by a normal vector (horizontalComponent, verticalComponent).
 * The projection formula is effectively (x*w + y*h) for each point,
 * and we sum up x and y components of points for which this projection is positive.
 * Then calculate (sum_x)^2 + (sum_y)^2.
 * @param {number} horizontalComponent The 'h' component of the normal vector for the line.
 * @param {number} verticalComponent The 'w' component of the normal vector for the line.
 * @returns {number} The squared length of the resultant vector.
 */
function computeProjectionSquaredLength ( horizontalComponent, verticalComponent ) {
  var totalXProjection = 0,
      totalYProjection = 0 ;

  // Iterate through all stored points.
  for ( var idx = 0 ; idx < totalPointsCount ; idx ++ ) {
    // The condition `x[i]*w + y[i]*h > 0` effectively checks if the dot product
    // of the point vector (x[i], y[i]) and the normal vector (h, w) is positive.
    // This means the point lies on one side of the line passing through the origin
    // perpendicular to (h, w). Only points on this side contribute to the sum.
    if ( xCoordinates [ idx ] * verticalComponent + yCoordinates [ idx ] * horizontalComponent > 0 ) {
      totalXProjection += xCoordinates [ idx ] ;
      totalYProjection += yCoordinates [ idx ] ;
    }
  }

  // Return the squared Euclidean distance of the resultant vector (totalXProjection, totalYProjection).
  return totalXProjection * totalXProjection + totalYProjection * totalYProjection ;
}