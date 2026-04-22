/*
 * This module processes input data to compute the sum of interior angles
 * for a polygon given its number of vertices.
 */

function AnalyzePolygonAngles( rawInputString )
{
    // Step 1: Cleanse the incoming textual data.
    // Remove any leading or trailing whitespace characters.
    let processedString = rawInputString.trim();

    // Step 2: Parse the cleaned string into a numerical value.
    // The second argument '10' ensures parsing is done in base-10 (decimal).
    const vertexCount = parseInt( processedString, 10 );

    // Step 3: Perform the geometric calculation.
    // The formula for the sum of interior angles of an n-sided polygon is (n-2) * 180 degrees.
    // Here, 'vertexCount' represents 'n'.
    let totalDegrees = ( vertexCount - 2 ) * 180;

    // Step 4: Output the final computed result.
    // The value is printed to the standard console output.
    console.log( totalDegrees );
}

// This section handles the execution flow when the script is run.
// It reads data from standard input, typically from a file or pipe.
// The 'utf8' encoding is specified for character interpretation.
AnalyzePolygonAngles( require("fs").readFileSync("/dev/stdin", "utf8") );