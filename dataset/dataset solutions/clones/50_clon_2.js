function calculateTriangleArea( sideA, sideB, sideC ) {
    // This function computes the area of a triangle given its three side lengths
    // using Heron's formula.
    const semiPerimeter = ( sideA + sideB + sideC ) / 2.0;

    const triangleArea = Math.sqrt(
        semiPerimeter *
        ( semiPerimeter - sideA ) *
        ( semiPerimeter - sideB ) *
        ( semiPerimeter - sideC )
    );

    return triangleArea;
}


// Acquire raw input data from standard input stream
const rawInputData = require('node:fs').readFileSync( '/dev/stdin', { encoding: 'utf8' } );

// Process the input: trim whitespace and split into individual lines
const dataLines = rawInputData.trim().split( '\n' );

// Iterate over each line of input data
for ( let lineIndex = 0; lineIndex < dataLines.length; ++lineIndex ) {
    // Parse numeric values from the current line, splitting by space
    const currentLineValues = dataLines[lineIndex].split( ' ' ).map( Number );

    // Extract coordinates for the main triangle's vertices
    const point1_X = currentLineValues[0];
    const point1_Y = currentLineValues[1];

    const point2_X = currentLineValues[2];
    const point2_Y = currentLineValues[3];

    const point3_X = currentLineValues[4];
    const point3_Y = currentLineValues[5];

    // Extract coordinates for the test point
    const testPoint_X = currentLineValues[6];
    const testPoint_Y = currentLineValues[7];

    // Calculate distances between the vertices of the main triangle
    const distance_P1P2 = Math.sqrt( Math.pow(point1_X - point2_X, 2) + Math.pow(point1_Y - point2_Y, 2) );
    const distance_P1P3 = Math.sqrt( Math.pow(point1_X - point3_X, 2) + Math.pow(point1_Y - point3_Y, 2) );
    const distance_P2P3 = Math.sqrt( Math.pow(point2_X - point3_X, 2) + Math.pow(point2_Y - point3_Y, 2) );

    // Calculate distances from the test point to each vertex of the main triangle
    const distance_TP_P1 = Math.sqrt( Math.pow(testPoint_X - point1_X, 2) + Math.pow(testPoint_Y - point1_Y, 2) );
    const distance_TP_P2 = Math.sqrt( Math.pow(testPoint_X - point2_X, 2) + Math.pow(testPoint_Y - point2_Y, 2) );
    const distance_TP_P3 = Math.sqrt( Math.pow(testPoint_X - point3_X, 2) + Math.pow(testPoint_Y - point3_Y, 2) );

    // Calculate the area of the main triangle
    const originalTriangleArea = calculateTriangleArea( distance_P1P2, distance_P1P3, distance_P2P3 );

    // Calculate the sum of areas of three smaller triangles formed by the test point
    const combinedSubTriangleArea = calculateTriangleArea( distance_P1P2, distance_TP_P1, distance_TP_P2 ) +
                                       calculateTriangleArea( distance_P1P3, distance_TP_P1, distance_TP_P3 ) +
                                       calculateTriangleArea( distance_P2P3, distance_TP_P2, distance_TP_P3 );

    // Determine if the test point is inside the main triangle
    // by comparing the main triangle's area to the sum of the sub-triangles' areas.
    // A small epsilon is used for floating-point comparison.
    if ( Math.abs( originalTriangleArea - combinedSubTriangleArea ) < 0.0005 ) {
        console.log( "YES" );
    } else {
        console.log( "NO" );
    }
}