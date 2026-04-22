'use strict';

/**
 * Executes the primary logic for calculating the final available area
 * based on a series of boundary modifications.
 * @param {string} inputString - The complete raw input data as a single string.
 */
const processInputData = ( inputString ) => {

    // First, clean up the input by removing leading/trailing whitespace
    // and then splitting it into an array of individual lines.
    const linesOfData = inputString.trim().split( '\n' );

    // Parse the initial overall dimensions (width, height) and the total
    // count of modification operations from the very first line of input.
    // The structure of the first line is "initialWidth initialHeight numberOfOperations".
    let initialWidthBound = linesOfData[0].split( ' ' ).map( numericString => Number( numericString ) )[0];
    let initialHeightBound = linesOfData[0].split( ' ' ).map( numericString => Number( numericString ) )[1];
    let numOperations = linesOfData[0].split( ' ' ).map( numericString => Number( numericString ) )[2];

    // Extract coordinate values and corresponding operation types for each modification.
    // These values are taken from all lines starting from the second line of input.
    const xCoordinates = linesOfData.slice( 1, linesOfData.length ).map( dataRow => Number( dataRow.split( ' ' )[0] ) );
    const yCoordinates = linesOfData.slice( 1, linesOfData.length ).map( dataRow => Number( dataRow.split( ' ' )[1] ) );
    const operationTypes = linesOfData.slice( 1, linesOfData.length ).map( dataRow => Number( dataRow.split( ' ' )[2] ) );

    // Initialize the four vertices of the rectangular working area.
    // The initial rectangle spans from (0,0) to (initialWidthBound, initialHeightBound).
    // The order of vertices is: (minX, minY), (minX, maxY), (maxX, maxY), (maxX, minY).
    let rectangleVertices = [
        { x: 0, y: 0 },                                  // Vertex at bottom-left
        { x: 0, y: initialHeightBound },                 // Vertex at top-left
        { x: initialWidthBound, y: initialHeightBound }, // Vertex at top-right
        { x: initialWidthBound, y: 0 }                   // Vertex at bottom-right
    ];

    // Process each boundary modification operation sequentially.
    // The loop runs for the total number of operations specified.
    for ( let operationIndex = 0; operationIndex < operationTypes.length; operationIndex++ ) {
        const currentOperation = operationTypes[operationIndex];

        // A switch statement handles different types of boundary constraints.
        switch ( currentOperation ) {
            case 1: // Type 1: Restrict region to X values greater than or equal to xCoordinates[operationIndex].
                    // This effectively moves the left boundary to the right.
                rectangleVertices[0].x = Math.max( xCoordinates[operationIndex], rectangleVertices[0].x );
                rectangleVertices[1].x = Math.max( xCoordinates[operationIndex], rectangleVertices[1].x );
                break;

            case 2: // Type 2: Restrict region to X values less than or equal to xCoordinates[operationIndex].
                    // This effectively moves the right boundary to the left.
                rectangleVertices[2].x = Math.min( xCoordinates[operationIndex], rectangleVertices[2].x );
                rectangleVertices[3].x = Math.min( xCoordinates[operationIndex], rectangleVertices[3].x );
                break;

            case 3: // Type 3: Restrict region to Y values greater than or equal to yCoordinates[operationIndex].
                    // This effectively moves the bottom boundary upwards.
                rectangleVertices[0].y = Math.max( yCoordinates[operationIndex], rectangleVertices[0].y );
                rectangleVertices[3].y = Math.max( yCoordinates[operationIndex], rectangleVertices[3].y );
                break;

            case 4: // Type 4: Restrict region to Y values less than or equal to yCoordinates[operationIndex].
                    // This effectively moves the top boundary downwards.
                rectangleVertices[1].y = Math.min( yCoordinates[operationIndex], rectangleVertices[1].y );
                rectangleVertices[2].y = Math.min( yCoordinates[operationIndex], rectangleVertices[2].y );
                break;
        }
    }

    // After applying all boundary constraints, calculate the dimensions
    // of the final rectangular region.
    const resultingWidth = rectangleVertices[2].x - rectangleVertices[0].x; // Max X - Min X
    const resultingHeight = rectangleVertices[1].y - rectangleVertices[0].y; // Max Y - Min Y

    // Compute the area of the resulting rectangle.
    // If the width or height has become negative (meaning the boundaries crossed each other),
    // then the area is considered to be zero.
    const calculatedArea = resultingWidth * resultingHeight;

    // Display the final calculated area. Ensure the output is not negative.
    console.log( calculatedArea >= 0 ? calculatedArea : 0 );
};

// Initiate the data processing by reading input from standard input.
processInputData( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );