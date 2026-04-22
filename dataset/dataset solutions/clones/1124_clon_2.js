/*
 * This script computes the area of a polygon using the shoelace formula.
 * It reads vertex coordinates from standard input, processes them,
 * and then prints the calculated area to standard output.
 *
 * Current implementation status: Functional and tested.
 *
 * Note: The input format expects coordinates per line, space-separated.
 */
const displayOutput = console.log; // Alias for logging messages

if ( typeof process !== "undefined" ) {
    let receivedInput = ""; // Buffer for incoming data stream
    process.stdin.resume(); // Ensure the input stream stays open
    process.stdin.setEncoding( 'utf8' ); // Set character encoding for input

    process.stdin.on( 'data', function( dataSegment ) {
        receivedInput += dataSegment; // Append new data to the buffer
    } );

    process.stdin.on( 'end', function() {
        const inputRows = receivedInput.split( "\n" ); // Split buffered input into individual rows
        calculateShapeArea( inputRows ); // Pass processed rows to the main calculation function
    } );
}


function calculateShapeArea( dataRows ) {
    // Process each row to extract numeric coordinates.
    const polygonVertices = dataRows.map( function( textRow ) {
        return textRow.split( " " )
                      .filter( function( segment ) {
                          return segment !== ""; // Remove empty segments
                      } )
                      .map( function( segment ) {
                          const parsedNum = Number( segment );
                          if ( parsedNum.toString() === "NaN" ) {
                              // Handle non-numeric segments, often newlines/carriage returns
                              return segment.replace( /(\r)|(\n)/g, "" );
                          }
                          return parsedNum; // Return the numeric coordinate
                      } );
    } );

    // Handle potential trailing empty line or incomplete input.
    let finalEntry = polygonVertices.pop();
    if ( finalEntry && finalEntry.length === 2 ) {
        polygonVertices.push( finalEntry ); // If it's a valid coordinate pair, re-add it.
    }

    // The first line typically contains the number of vertices, which is not used directly here.
    polygonVertices.shift(); // Remove the header/first line of input if present.

    // Shoelace formula implementation:
    // Select the first vertex as a reference point for triangulation.
    const originVertex = polygonVertices[0];
    let accumulatedArea = 0; // Accumulator for the signed areas of triangles.
    const numVertices = polygonVertices.length;

    for ( let vertexIndex = 1; vertexIndex < numVertices - 1; vertexIndex++ ) {
        // Iterate through vertices, forming triangles with the origin vertex.
        const currentVertex = polygonVertices[ vertexIndex ];
        const nextVertex = polygonVertices[ vertexIndex + 1 ];
        accumulatedArea += getSignedTriangleArea( originVertex, currentVertex, nextVertex );
    }

    // The total signed area needs to be divided by 2 to get the actual polygon area.
    let resultAreaText = String( accumulatedArea / 2 );
    const decimalPointIndex = resultAreaText.indexOf( "." );

    if ( decimalPointIndex === -1 ) {
        // If no decimal point, append ".0" for consistent formatting.
        resultAreaText += ".0";
    } else {
        // Truncate to one decimal place if more exist (e.g., 12.34 -> 12.3).
        // This specific slice results in one decimal place if it exists.
        resultAreaText = resultAreaText.slice( 0, decimalPointIndex + 2 );
    }

    displayOutput( resultAreaText ); // Print the final formatted area.
}

function getSignedTriangleArea( pointA, pointB, pointC ) {
    // Calculate two vectors originating from pointA.
    const vector1 = [ pointB[0] - pointA[0], pointB[1] - pointA[1] ];
    const vector2 = [ pointC[0] - pointA[0], pointC[1] - pointA[1] ];

    // The signed area is half the magnitude of the cross product of these vectors.
    // Here, we return twice the signed area (the determinant value).
    return calculateCrossProductMagnitude( vector1, vector2 );
}

function calculateCrossProductMagnitude( vecA, vecB ) {
    // Compute the 2D cross product (determinant) for two vectors.
    // This value represents twice the signed area of the triangle formed by the origin and the two vectors.
    return ( vecA[0] * vecB[1] - vecA[1] * vecB[0] );
}