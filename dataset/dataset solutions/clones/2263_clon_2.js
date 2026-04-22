/*
 * This module processes geometric point data to find the radius of the minimum enclosing circle.
 * It handles input from a string, parses coordinates, and calculates the smallest circle
 * that contains all given points.
 */
function ProcessData( rawInput ) {
    // Split the entire input string by newline characters to get individual lines.
    rawInput = rawInput.split( '\n' );

    // Parse the first line to determine the total number of points.
    const pointCount = parseInt( rawInput[0] );

    // Remove the first line as it's already processed (contains point count).
    rawInput.shift();

    // Trim any extra lines beyond the actual point data.
    rawInput.splice( pointCount, rawInput.length );

    // Transform the raw input lines into an array of coordinate pairs (numbers).
    const pointCoordinates = rawInput.map( lineStr =>
        lineStr.split( ' ' ).map( coordStr => parseInt( coordStr ) )
    );

    // Initialize the variable to store the maximum radius found.
    let maximumRadius = 0;

    // Special case: If only two points are provided, the minimum enclosing circle
    // is simply the circle whose diameter is the segment connecting the two points.
    if ( pointCoordinates.length === 2 ) {
        // Calculate the distance between the two points, then divide by 2 for the radius.
        maximumRadius = Math.sqrt(
            Math.pow( pointCoordinates[0][0] - pointCoordinates[1][0], 2 ) +
            Math.pow( pointCoordinates[0][1] - pointCoordinates[1][1], 2 )
        ) / 2;
    } else {
        // For three or more points, iterate through all possible combinations of three points
        // to find the minimum enclosing circle for each triplet.
        // This forms the basis for Welzl's algorithm or similar approaches, simplified here.

        // Outer loop: selects the first point for the triplet.
        for ( let firstPointIndex = 0; firstPointIndex < pointCount; firstPointIndex++ ) {
            // Middle loop: selects the second point for the triplet, ensuring it's distinct from the first.
            for ( let secondPointIndex = firstPointIndex + 1; secondPointIndex < pointCount; secondPointIndex++ ) {
                // Inner loop: selects the third point for the triplet, distinct from the first two.
                for ( let thirdPointIndex = secondPointIndex + 1; thirdPointIndex < pointCount; thirdPointIndex++ ) {

                    // Array to store squared edge lengths and their corresponding indices for sorting.
                    let squaredDistances = [];

                    // Calculate squared distances for the three sides of the triangle formed by the points.
                    // The indices (0, 1, 2) correspond to which point pair forms the edge.
                    squaredDistances.push( [
                        Math.pow( pointCoordinates[firstPointIndex][0] - pointCoordinates[secondPointIndex][0], 2 ) +
                        Math.pow( pointCoordinates[firstPointIndex][1] - pointCoordinates[secondPointIndex][1], 2 ),
                        0 // Edge between point1 and point2
                    ] );
                    squaredDistances.push( [
                        Math.pow( pointCoordinates[firstPointIndex][0] - pointCoordinates[thirdPointIndex][0], 2 ) +
                        Math.pow( pointCoordinates[firstPointIndex][1] - pointCoordinates[thirdPointIndex][1], 2 ),
                        1 // Edge between point1 and point3
                    ] );
                    squaredDistances.push( [
                        Math.pow( pointCoordinates[thirdPointIndex][0] - pointCoordinates[secondPointIndex][0], 2 ) +
                        Math.pow( pointCoordinates[thirdPointIndex][1] - pointCoordinates[secondPointIndex][1], 2 ),
                        2 // Edge between point3 and point2
                    ] );

                    // Sort the squared distances in descending order.
                    squaredDistances.sort( ( valA, valB ) => valB[0] - valA[0] );

                    let circleCenterX, circleCenterY, circleRadiusSq;

                    // Check if the triangle is obtuse or right-angled.
                    // If the square of the longest side is greater than the sum of the squares of the other two sides,
                    // the minimum enclosing circle's diameter is the longest side.
                    if ( squaredDistances[0][0] > squaredDistances[1][0] + squaredDistances[2][0] ) {
                        // The diameter of the circle is the longest edge.
                        // Determine which pair of points forms this longest edge.
                        if ( squaredDistances[0][1] === 0 ) { // Longest edge is between point1 and point2
                            circleCenterX = ( pointCoordinates[firstPointIndex][0] + pointCoordinates[secondPointIndex][0] ) / 2;
                            circleCenterY = ( pointCoordinates[firstPointIndex][1] + pointCoordinates[secondPointIndex][1] ) / 2;
                            circleRadiusSq = Math.pow( pointCoordinates[firstPointIndex][0] - circleCenterX, 2 ) +
                                             Math.pow( pointCoordinates[firstPointIndex][1] - circleCenterY, 2 );
                        } else if ( squaredDistances[0][1] === 1 ) { // Longest edge is between point1 and point3
                            circleCenterX = ( pointCoordinates[firstPointIndex][0] + pointCoordinates[thirdPointIndex][0] ) / 2;
                            circleCenterY = ( pointCoordinates[firstPointIndex][1] + pointCoordinates[thirdPointIndex][1] ) / 2;
                            circleRadiusSq = Math.pow( pointCoordinates[firstPointIndex][0] - circleCenterX, 2 ) +
                                             Math.pow( pointCoordinates[firstPointIndex][1] - circleCenterY, 2 );
                        } else { // Longest edge is between point2 and point3
                            circleCenterX = ( pointCoordinates[secondPointIndex][0] + pointCoordinates[thirdPointIndex][0] ) / 2;
                            circleCenterY = ( pointCoordinates[secondPointIndex][1] + pointCoordinates[thirdPointIndex][1] ) / 2;
                            circleRadiusSq = Math.pow( pointCoordinates[secondPointIndex][0] - circleCenterX, 2 ) +
                                             Math.pow( pointCoordinates[secondPointIndex][1] - circleCenterY, 2 );
                        }
                    } else {
                        // The triangle is acute or right-angled (but not strictly obtuse).
                        // The minimum enclosing circle is the circumcircle of the triangle.
                        // Calculate the circumcenter (circleCenterX, circleCenterY) and circumradius squared.
                        // This involves solving a system of equations for the perpendicular bisectors.

                        // Pre-calculate common terms for clarity in the complex formulas.
                        const p1x = pointCoordinates[firstPointIndex][0];
                        const p1y = pointCoordinates[firstPointIndex][1];
                        const p2x = pointCoordinates[secondPointIndex][0];
                        const p2y = pointCoordinates[secondPointIndex][1];
                        const p3x = pointCoordinates[thirdPointIndex][0];
                        const p3y = pointCoordinates[thirdPointIndex][1];

                        const p1sq = Math.pow(p1x, 2) + Math.pow(p1y, 2);
                        const p2sq = Math.pow(p2x, 2) + Math.pow(p2y, 2);
                        const p3sq = Math.pow(p3x, 2) + Math.pow(p3y, 2);

                        const denom = 2 * ( (p3x - p1x) * (p1y - p2y) - (p2x - p1x) * (p1y - p3y) );

                        // Handle potential division by zero if points are collinear.
                        // In this problem context, points are likely not perfectly collinear for circumcircles,
                        // or this case would be handled by the two-point scenario or a larger circle.
                        // Assuming non-collinear for this branch.
                        if (denom === 0) {
                            // This scenario implies collinear points or identical points.
                            // The problem constraints or prior logic (e.g., two-point case)
                            // might implicitly handle this, or it indicates an edge case.
                            // For a Type II clone, we must maintain original logic.
                            // The original code does not explicitly check for denom === 0 here.
                            // It relies on the larger circle check to cover it if it leads to an issue.
                            // Let's proceed as the original code does.
                        }

                        circleCenterY = (
                            (p3x - p1x) * (p1sq - p2sq) -
                            (p2x - p1x) * (p1sq - p3sq)
                        ) / denom;

                        // Calculate circleCenterX based on which x-coordinates are different to avoid division by zero.
                        if ( p1x !== p2x ) {
                            circleCenterX = (
                                2 * (p1y - p2y) * circleCenterY -
                                p1sq + p2sq
                            ) / ( 2 * (p2x - p1x) );
                        } else { // If p1x == p2x, then p1x != p3x must hold for non-collinear points.
                            circleCenterX = (
                                2 * (p1y - p3y) * circleCenterY -
                                p1sq + p3sq
                            ) / ( 2 * (p3x - p1x) );
                        }

                        // Calculate the squared radius from one of the points to the circumcenter.
                        circleRadiusSq = Math.pow( p1x - circleCenterX, 2 ) + Math.pow( p1y - circleCenterY, 2 );
                    }

                    // Now, verify if all other points are contained within this candidate circle.
                    let allPointsContained = true;
                    // Iterate through all original points.
                    for ( let currentPointIdx = 0; currentPointIdx < pointCount; currentPointIdx++ ) {
                        // Calculate the squared distance from the current point to the candidate circle's center.
                        const distToCenterSq = Math.pow( pointCoordinates[currentPointIdx][0] - circleCenterX, 2 ) +
                                               Math.pow( pointCoordinates[currentPointIdx][1] - circleCenterY, 2 );

                        // If any point is outside the circle (with a small epsilon for floating point inaccuracies),
                        // this circle is not the minimum enclosing circle for all points.
                        if ( distToCenterSq > circleRadiusSq + 0.000001 ) {
                            allPointsContained = false;
                            break; // No need to check further points for this circle.
                        }
                    }

                    // If all points are contained, this circle is a candidate for the minimum enclosing circle.
                    // Update the maximum radius found so far.
                    if ( allPointsContained ) {
                        maximumRadius = Math.sqrt( circleRadiusSq );
                        // If a valid circle is found, and it's the minimum enclosing circle for these points,
                        // we can potentially break out early if we're looking for *any* such circle.
                        // The original logic implies finding the first one that works for a triplet.
                        break;
                    }
                }
                // Break out of the middle loop if a solution was found.
                if ( maximumRadius !== 0 ) {
                    break;
                }
            }
            // Break out of the outer loop if a solution was found.
            if ( maximumRadius !== 0 ) {
                break;
            }
        }
    }

    // Output the calculated maximum radius.
    console.log( '%s', maximumRadius );
    return maximumRadius; // Return the final result.
}

/*
 * This auxiliary function is for debugging purposes in a browser environment.
 * It simulates input from a text area and displays the result.
 */
function TestFunction( testNumber ) {
    // Retrieve input string from a specific HTML element.
    const testInput = document.getElementById( 'input' + testNumber ).value;
    // Process the input using the main logic.
    const calculatedResult = ProcessData( testInput );
    // Initialize the test outcome.
    let testOutcome = 'WA'; // "Wrong Answer" by default.

    // Compare the calculated result with the expected output from another HTML element.
    if ( calculatedResult.toString() === document.getElementById( 'output' + testNumber ).value.split( '\n' )[0] ) {
        testOutcome = 'AC'; // "Accepted" if results match.
    }
    // Display the test outcome in a designated HTML element.
    document.getElementById( 'result' + testNumber ).innerHTML = testOutcome;
}

// Execute the main processing function with input read from standard input in a Node.js environment.
ProcessData( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );