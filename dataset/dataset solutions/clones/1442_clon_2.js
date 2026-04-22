(function (rawDataContent) {
    // Process the entire raw data block to get individual lines
    var linesOfData = rawDataContent
                        .replace( /\r/g, '' )
                        .split( "\n" );

    // Extract the first line and parse its components for triangle dimensions
    var   firstLineComponents = linesOfData.shift().split( " " ),
          sideAValue = parseInt( firstLineComponents[0] ),
          sideBValue = parseInt( firstLineComponents[1] ),
          angleInDegrees = parseInt( firstLineComponents[2] ), // Angle in degrees from input

          angleInRadians = angleInDegrees * Math.PI / 180, // Convert degrees to radians for Math functions
          // Note: Calculation for the third side (c) is commented out in the original.
          // var thirdSide = Math.sqrt( sideAValue * sideAValue + sideBValue * sideBValue - ( 2 * sideAValue * sideBValue * Math.cos( angleInRadians ) ) ),

          areaOfTriangle = 0.5 * sideAValue * sideBValue * Math.sin( angleInRadians ), // Calculate the area 's'
          totalPerimeter = sideAValue + sideBValue + Math.sqrt( sideAValue * sideAValue + sideBValue * sideBValue - ( 2 * sideAValue * sideBValue * Math.cos( angleInRadians ) ) ), // Calculate the perimeter 'l'
          altitudeOfTriangle = sideBValue * Math.sin( angleInRadians ); // Calculate the height 'h'

    // Output the computed results, formatted to eight decimal places, separated by newlines
    console.log(
          areaOfTriangle.toFixed(8)
        + "\n"
        + totalPerimeter.toFixed(8)
        + "\n"
        + altitudeOfTriangle.toFixed(8)
    );

})( require("fs").readFileSync("/dev/stdin", "utf8") );