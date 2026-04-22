/*
 * This module provides a flexible input parsing utility,
 * allowing extraction of tokens, lines, or matrices from a string.
 */
var InputProcessor = ( function ( ) {

    // Factory function to create a new data reader instance.
    function createReader ( rawInputString ) {
        return new DataLineReader ( rawInputString ) ;
    }

    // Constructor for the DataLineReader class.
    function DataLineReader ( sourceText ) {
        this.linesData = sourceText.trim ( ) . split ( "\n" ) ; // Store lines, trimmed.
        this.currentLineIndex = 0 ;                          // Pointer to the current line.
    }

    // Method to read a single token from the current line.
    DataLineReader.prototype.readNextToken = function ( returnAsStringFlag ) {
        var lineBuffer = this.linesData ,
            lineIdx = this.currentLineIndex ,
            extractedToken ;

        // If the current line hasn't been processed into tokens yet, do so.
        if ( typeof lineBuffer[ lineIdx ] === "string" ) {
            lineBuffer[ lineIdx ] = lineBuffer[ lineIdx ] . split ( " " ) . reverse ( ) ;
        }

        extractedToken = lineBuffer[ lineIdx ] . pop ( ) ; // Get the last token.

        // If the line is now empty, advance to the next line.
        if ( ! lineBuffer[ lineIdx ] . length ) {
            this.currentLineIndex ++ ;
        }

        // Return as string or convert to number based on flag.
        return returnAsStringFlag ? extractedToken : + extractedToken ;
    } ;

    // Method to read all tokens from the current line.
    DataLineReader.prototype.readNextLineTokens = function ( returnAsStringsFlag ) {
        var tokens = this.linesData[ this.currentLineIndex ++ ] . split ( " " ) ;
        // Return as strings or convert all to numbers.
        return returnAsStringsFlag ? tokens : tokens . map ( tokenValue => + tokenValue ) ;
    } ;

    // Method to read a specified number of lines as a matrix.
    DataLineReader.prototype.readMatrix = function ( numRowsToRead , returnElementsAsStringsFlag ) {
        var matrixRows = this.linesData . slice ( this.currentLineIndex , this.currentLineIndex += numRowsToRead ) . map ( rowString => rowString . split ( " " ) ) ;
        // Return elements as strings or convert all to numbers.
        return returnElementsAsStringsFlag ? matrixRows : matrixRows . map ( row => row . map ( elementValue => + elementValue ) ) ;
    } ;

    // Method to read a specified number of raw lines.
    DataLineReader.prototype.readRawLines = function ( numLinesToRead , returnLinesAsStringsFlag ) {
        var selectedLines = this.linesData . slice ( this.currentLineIndex , this.currentLineIndex += numLinesToRead ) ;
        // Return lines as strings or convert each line to a number (if it's a single number).
        return returnLinesAsStringsFlag ? selectedLines : selectedLines . map ( lineData => + lineData ) ;
    } ;

    return createReader ; // Expose the factory function.

} ) ( ) ;

// Initialize the input data parser by reading from standard input.
var dataParserInstance = InputProcessor ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

/*
 * Utility function to create a multi-dimensional array initialized with a value.
 * Example: createMultiDimArray(0, 2, 3) creates a 2x3 array of zeros.
 */
function initializeNDArray ( initialValue ) {
    var argumentList = arguments ,
        argumentCount = argumentList . length ,
        arrayConstructionString = "Array(argumentList[" + -- argumentCount + "]).fill(0).map( _ => {return " + initialValue + ";})" ;

    // Construct the nested array creation string.
    while ( -- argumentCount ) {
        arrayConstructionString = "Array(argumentList[" + argumentCount + "]).fill(0).map( _ => " + arrayConstructionString + ")" ;
    }

    return eval ( arrayConstructionString ) ; // Evaluate the string to create the array.
}

var totalPointsCount ; // Variable to store the number of points.
var pointCoordinates = [ ] ; // Array to store processed coordinate pairs and their angles.

// Output the result of the main calculation function.
console . log ( calculateMaxDistance ( ) ) ;

/*
 * Main function to solve the problem: find the maximum squared distance
 * from the origin by combining vectors. This uses a rotating calipers-like
 * approach on an angularly sorted and duplicated set of points.
 */
function calculateMaxDistance ( ) {

    totalPointsCount = dataParserInstance . readNextToken ( ) ; // Read the initial count of points.

    // Process each input point.
    for ( var loopIndex = 0 ; loopIndex < totalPointsCount ; loopIndex ++ ) {
        var currentX = dataParserInstance . readNextToken ( ) ,
            currentY = dataParserInstance . readNextToken ( ) ;

        // Skip points at the origin (0,0) as they don't contribute to distance.
        if ( currentX === 0 && currentY === 0 ) {
            continue ;
        }

        // Store the point along with its calculated angle.
        pointCoordinates . push ( [ currentX , currentY , determineAngle ( currentX , currentY ) ] ) ;
    }

    totalPointsCount = pointCoordinates . length ; // Update count after filtering (0,0) points.

    // Sort points by their angle to facilitate processing in angular order.
    pointCoordinates . sort ( ( pointA , pointB ) => pointA[ 2 ] - pointB[ 2 ] ) ;

    // Duplicate the points array. This allows for a continuous 360-degree sweep
    // without complex modulo arithmetic for wrapping around.
    pointCoordinates = pointCoordinates . concat ( pointCoordinates ) ;

    var maximumSquaredResult = 0 ; // Stores the maximum squared distance found.
    var currentCombinedX = 0 ,
        currentCombinedY = 0 ,
        segmentStartIndex = 0 ; // Pointer for the start of the current segment (window).

    // Iterate through the extended list of points, sliding a window.
    for ( var currentPointIndex = 0 ; currentPointIndex < totalPointsCount ; currentPointIndex ++ ) {
        // Expand the segment by adding points until the distance starts decreasing.
        while ( segmentStartIndex < currentPointIndex + totalPointsCount ) {
            var potentialNextX = currentCombinedX + pointCoordinates[ segmentStartIndex ][ 0 ] ;
            var potentialNextY = currentCombinedY + pointCoordinates[ segmentStartIndex ][ 1 ] ;

            var currentSquaredMagnitude = currentCombinedX * currentCombinedX + currentCombinedY * currentCombinedY ;
            var nextSquaredMagnitude = potentialNextX * potentialNextX + potentialNextY * potentialNextY ;

            // If adding the next point doesn't increase the distance, stop expanding this segment.
            if ( currentSquaredMagnitude >= nextSquaredMagnitude ) {
                break ;
            }

            // Update combined coordinates and advance segment start pointer.
            currentCombinedX = potentialNextX ;
            currentCombinedY = potentialNextY ;
            segmentStartIndex ++ ;
        }

        // Calculate the squared distance for the current optimal segment.
        var segmentCurrentSquaredMagnitude = currentCombinedX * currentCombinedX + currentCombinedY * currentCombinedY ;

        // Update the overall maximum if this segment's distance is greater.
        if ( maximumSquaredResult < segmentCurrentSquaredMagnitude ) {
            maximumSquaredResult = segmentCurrentSquaredMagnitude ;
        }

        // Remove the oldest point from the segment (slide the window forward).
        currentCombinedX -= pointCoordinates[ currentPointIndex ][ 0 ] ;
        currentCombinedY -= pointCoordinates[ currentPointIndex ][ 1 ] ;
    }

    // Return the square root of the maximum squared distance to get the actual distance.
    return Math . sqrt ( maximumSquaredResult ) ;
}

/*
 * Helper function to determine the angle of a point (x, y) in degrees.
 * Handles quadrant logic and special cases for axes to ensure correct angular order.
 */
function determineAngle ( xCoordinate , yCoordinate ) {
    // Special case: point on the Y-axis.
    if ( xCoordinate === 0 ) {
        return yCoordinate > 0 ? 90 : 270 ; // 90 degrees for positive Y, 270 for negative Y.
    }
    // Special case: point on the X-axis.
    if ( yCoordinate === 0 ) {
        return xCoordinate > 0 ? 0 : 180 ; // 0 degrees for positive X, 180 for negative X.
    }

    // Calculate angle using arctan, then convert from radians to degrees.
    var calculatedAngleDegrees = Math . atan ( yCoordinate / xCoordinate ) / Math . PI * 180 ;

    // Adjust for quadrants: add 180 degrees if x is negative.
    if ( xCoordinate < 0 ) {
        calculatedAngleDegrees += 180 ;
    }
    // Ensure the angle is positive and within the 0-360 degree range.
    if ( calculatedAngleDegrees < 0 ) {
        calculatedAngleDegrees += 360 ;
    }

    // Round to a high precision to mitigate floating-point inaccuracies when comparing angles.
    const ANGLE_PRECISION_FACTOR = 1e7 ;
    return Math . round ( calculatedAngleDegrees * ANGLE_PRECISION_FACTOR ) / ANGLE_PRECISION_FACTOR ;
}